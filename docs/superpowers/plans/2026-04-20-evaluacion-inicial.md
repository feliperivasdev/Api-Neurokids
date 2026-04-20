# Evaluación Inicial — Plan de Implementación

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Implementar el flujo completo de evaluación inicial para estudiantes: selección de tema → generación de lectura+preguntas por IA → guardado en BD → recepción de respuestas del estudiante.

**Architecture:** Servicio orquestador (`evaluacionInicialService`) coordina el flujo de 8 pasos de inserción en BD usando una sola llamada al wrapper de IA (`iaGeneracionService`). El controller delega toda lógica al servicio y solo maneja HTTP. Las rutas usan `verificarToken` + `verificarEstudiante`.

**Tech Stack:** Express.js 4, Sequelize 6, PostgreSQL (Neon.tech), axios (para llamadas IA), dotenv.

---

## Archivos

| Archivo | Acción |
|---------|--------|
| `config/temas.js` | Crear |
| `services/iaGeneracionService.js` | Crear |
| `services/evaluacionInicialService.js` | Crear |
| `controllers/evaluaciones_inicialesController.js` | Implementar (actualmente vacío) |
| `routes/evaluaciones_inicialesRouter.js` | Implementar (actualmente vacío) |
| `app.js` | Modificar — montar ruta |
| `.example.env` | Modificar — agregar vars de IA |

---

## Task 1: Instalar axios y configurar variables de entorno

**Files:**
- Modify: `package.json`
- Modify: `.example.env`

- [ ] **Step 1: Instalar axios**

```bash
npm install axios
```

Verificar que aparece en `package.json` bajo `dependencies`.

- [ ] **Step 2: Agregar vars al .example.env**

Agregar al final de `.example.env`:
```
IA_PROVIDER=claude
IA_API_KEY=tu_api_key_aqui
IA_MODEL=claude-opus-4-5
```

- [ ] **Step 3: Commit**

```bash
git add package.json package-lock.json .example.env
git commit -m "chore: add axios and IA env vars"
```

---

## Task 2: Configuración de temas hardcoded

**Files:**
- Create: `config/temas.js`

- [ ] **Step 1: Crear el archivo**

Crear `config/temas.js`:

```js
const TEMAS_BASE = ['animales', 'naturaleza', 'familia', 'aventura', 'deportes', 'ciencia', 'arte', 'música'];
const TEMAS_AVANZADOS = ['historia', 'tecnología', 'medio ambiente'];

const PARAMS_POR_EDAD = {
  '5-6':   { minPalabras: 80,  maxPalabras: 120, nivelLectura: 'básico',      longitudPalabras: 'corta' },
  '7-8':   { minPalabras: 120, maxPalabras: 180, nivelLectura: 'básico',      longitudPalabras: 'media' },
  '9-10':  { minPalabras: 180, maxPalabras: 250, nivelLectura: 'intermedio',  longitudPalabras: 'media' },
  '11-12': { minPalabras: 250, maxPalabras: 350, nivelLectura: 'intermedio',  longitudPalabras: 'larga' },
};

function getParamsPorEdad(edad) {
  if (edad >= 5 && edad <= 6)   return PARAMS_POR_EDAD['5-6'];
  if (edad >= 7 && edad <= 8)   return PARAMS_POR_EDAD['7-8'];
  if (edad >= 9 && edad <= 10)  return PARAMS_POR_EDAD['9-10'];
  if (edad >= 11 && edad <= 12) return PARAMS_POR_EDAD['11-12'];
  // fallback para edades fuera de rango
  if (edad < 5)  return PARAMS_POR_EDAD['5-6'];
  return PARAMS_POR_EDAD['11-12'];
}

function getTemasParaGrupo(edadMinima) {
  if (edadMinima >= 9) return [...TEMAS_BASE, ...TEMAS_AVANZADOS];
  return [...TEMAS_BASE];
}

function esTemValido(tema, edadMinima) {
  return getTemasParaGrupo(edadMinima).includes(tema);
}

module.exports = { getParamsPorEdad, getTemasParaGrupo, esTemValido };
```

- [ ] **Step 2: Verificar sintaxis**

```bash
node -e "const t = require('./config/temas'); console.log(t.getTemasParaGrupo(5)); console.log(t.getParamsPorEdad(8));"
```

Salida esperada:
```
['animales', 'naturaleza', 'familia', 'aventura', 'deportes', 'ciencia', 'arte', 'música']
{ minPalabras: 120, maxPalabras: 180, nivelLectura: 'básico', longitudPalabras: 'media' }
```

- [ ] **Step 3: Commit**

```bash
git add config/temas.js
git commit -m "feat: add hardcoded temas config with age-based params"
```

---

## Task 3: Wrapper de IA (iaGeneracionService)

**Files:**
- Create: `services/iaGeneracionService.js`

- [ ] **Step 1: Crear el servicio**

Crear `services/iaGeneracionService.js`:

```js
const axios = require('axios');

const PROVIDER = process.env.IA_PROVIDER || 'claude';
const API_KEY  = process.env.IA_API_KEY;
const MODEL    = process.env.IA_MODEL;

function buildPrompt(edad, tema, minPalabras, maxPalabras) {
  return `Eres un especialista en literacidad infantil. Crea material de lectura y comprensión para un niño de ${edad} años sobre el tema "${tema}".

REGLAS ESTRICTAS DEL TEXTO:
- Oraciones de máximo 8 palabras
- Una idea por oración
- Párrafos de máximo 3 oraciones
- Vocabulario cotidiano, sin tecnicismos
- Sin metáforas, refranes ni ironía
- Sin referencias a dificultades de aprendizaje, terapias o condiciones médicas
- Entre ${minPalabras} y ${maxPalabras} palabras en total
- Narrativa tipo cuento con inicio, nudo y desenlace claro

REGLAS DE PREGUNTAS:
- Exactamente 5 preguntas de comprensión
- Tipo opción múltiple, 4 opciones cada una
- Solo 1 respuesta correcta por pregunta
- Opciones cortas (máximo 6 palabras)
- Preguntas literales (la respuesta está explícita en el texto)
- Sin preguntas de inferencia ni de opinión personal

FORMATO DE RESPUESTA:
Responde ÚNICAMENTE con JSON válido. Sin texto antes ni después. Sin markdown.

{
  "titulo": "string",
  "contenido": "string",
  "resumen": "string con máximo 2 oraciones",
  "numero_palabras": number,
  "tiempo_lectura_estimado": number,
  "preguntas": [
    {
      "pregunta": "string",
      "orden_pregunta": number,
      "opciones": [
        { "texto_opcion": "string", "es_correcta": false, "orden_opcion": 1 },
        { "texto_opcion": "string", "es_correcta": true,  "orden_opcion": 2 },
        { "texto_opcion": "string", "es_correcta": false, "orden_opcion": 3 },
        { "texto_opcion": "string", "es_correcta": false, "orden_opcion": 4 }
      ]
    }
  ]
}`;
}

async function llamarClaude(prompt) {
  const model = MODEL || 'claude-opus-4-5';
  const resp = await axios.post(
    'https://api.anthropic.com/v1/messages',
    {
      model,
      max_tokens: 2048,
      messages: [{ role: 'user', content: prompt }]
    },
    {
      headers: {
        'x-api-key': API_KEY,
        'anthropic-version': '2023-06-01',
        'content-type': 'application/json'
      },
      timeout: 45000
    }
  );
  return resp.data.content[0].text;
}

async function llamarOpenAI(prompt) {
  const model = MODEL || 'gpt-4o-mini';
  const resp = await axios.post(
    'https://api.openai.com/v1/chat/completions',
    {
      model,
      messages: [{ role: 'user', content: prompt }],
      max_tokens: 2048
    },
    {
      headers: {
        'Authorization': `Bearer ${API_KEY}`,
        'content-type': 'application/json'
      },
      timeout: 45000
    }
  );
  return resp.data.choices[0].message.content;
}

async function llamarGemini(prompt) {
  const model = MODEL || 'gemini-1.5-flash';
  const resp = await axios.post(
    `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${API_KEY}`,
    {
      contents: [{ parts: [{ text: prompt }] }]
    },
    {
      headers: { 'content-type': 'application/json' },
      timeout: 45000
    }
  );
  return resp.data.candidates[0].content.parts[0].text;
}

function parsearRespuestaIA(texto) {
  const limpio = texto.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim();
  const data = JSON.parse(limpio);

  if (!data.titulo || !data.contenido || !Array.isArray(data.preguntas)) {
    throw new Error('Respuesta IA incompleta: faltan campos requeridos');
  }
  if (data.preguntas.length !== 5) {
    throw new Error(`Respuesta IA inválida: se esperaban 5 preguntas, llegaron ${data.preguntas.length}`);
  }
  for (const p of data.preguntas) {
    if (!Array.isArray(p.opciones) || p.opciones.length !== 4) {
      throw new Error('Respuesta IA inválida: cada pregunta debe tener 4 opciones');
    }
    const correctas = p.opciones.filter(o => o.es_correcta === true).length;
    if (correctas !== 1) {
      throw new Error('Respuesta IA inválida: cada pregunta debe tener exactamente 1 opción correcta');
    }
  }
  return data;
}

async function generarLecturaConPreguntas({ edad, tema, minPalabras, maxPalabras }) {
  if (!API_KEY) throw new Error('IA_API_KEY no configurada en variables de entorno');

  const prompt = buildPrompt(edad, tema, minPalabras, maxPalabras);
  let textoRespuesta;

  if (PROVIDER === 'openai') {
    textoRespuesta = await llamarOpenAI(prompt);
  } else if (PROVIDER === 'gemini') {
    textoRespuesta = await llamarGemini(prompt);
  } else {
    textoRespuesta = await llamarClaude(prompt);
  }

  return { data: parsearRespuestaIA(textoRespuesta), prompt };
}

module.exports = { generarLecturaConPreguntas };
```

- [ ] **Step 2: Verificar sintaxis**

```bash
node -e "require('./services/iaGeneracionService'); console.log('OK');"
```

Salida esperada: `OK`

- [ ] **Step 3: Commit**

```bash
git add services/iaGeneracionService.js
git commit -m "feat: add IA generation service wrapper (claude/openai/gemini)"
```

---

## Task 4: Servicio orquestador (evaluacionInicialService)

**Files:**
- Create: `services/evaluacionInicialService.js`

- [ ] **Step 1: Crear el servicio**

Crear `services/evaluacionInicialService.js`:

```js
const db = require('../models');
const { generarLecturaConPreguntas } = require('./iaGeneracionService');
const { getParamsPorEdad, getTemasParaGrupo, esTemValido } = require('../config/temas');

const GruposEdad               = db.grupos_edad_model;
const ParametrosGeneracion     = db.parametros_generacion_lectura_model;
const LecturasGeneradas        = db.lecturas_generadas_model;
const EvaluacionesIniciales    = db.evaluaciones_iniciales_model;
const PreguntasEvaluacion      = db.preguntas_evaluacion_model;
const OpcionesRespuesta        = db.opciones_respuesta_model;
const ResultadosEvaluacion     = db.resultados_evaluacion_model;
const RespuestasEstudiante     = db.respuestas_estudiante_model;
const Estudiantes              = db.estudiantes_model;

async function getTemasDisponibles(grupoEdadId) {
  const grupo = await GruposEdad.findByPk(grupoEdadId);
  if (!grupo) throw { status: 404, message: 'Grupo de edad no encontrado' };
  return getTemasParaGrupo(grupo.edad_minima);
}

async function setupEvaluacionInicial({ estudiante_id, edad, tema }) {
  // 1. Validar estudiante
  const estudiante = await Estudiantes.findByPk(estudiante_id);
  if (!estudiante) throw { status: 404, message: 'Estudiante no encontrado' };

  // 2. Buscar grupo_edad
  const grupoEdad = await GruposEdad.findOne({
    where: db.sequelize.literal(`edad_minima <= ${parseInt(edad)} AND edad_maxima >= ${parseInt(edad)}`)
  });
  if (!grupoEdad) throw { status: 404, message: `No existe grupo de edad configurado para ${edad} años` };

  // 3. Validar tema
  if (!esTemValido(tema, grupoEdad.edad_minima)) {
    throw { status: 400, message: `Tema "${tema}" no válido para este grupo de edad` };
  }

  // 4. Verificar que no tenga evaluación inicial previa
  const evaluacionesDelGrupo = await EvaluacionesIniciales.findAll({
    where: { grupo_edad_id: grupoEdad.id },
    attributes: ['id']
  });
  const evaluacionIds = evaluacionesDelGrupo.map(e => e.id);
  if (evaluacionIds.length > 0) {
    const yaExiste = await ResultadosEvaluacion.findOne({
      where: {
        estudiante_id,
        evaluacion_id: evaluacionIds
      }
    });
    if (yaExiste) throw { status: 409, message: 'El estudiante ya completó la evaluación inicial' };
  }

  // 5. Obtener params por edad
  const params = getParamsPorEdad(edad);

  // 6. Crear parametros_generacion_lectura
  const parametro = await ParametrosGeneracion.create({
    id: Date.now(),
    nombre: `Param-${estudiante_id}-${tema}-${Date.now()}`,
    grupo_edad_id: grupoEdad.id,
    nivel_lectura: params.nivelLectura,
    temas_preferidos: [tema],
    longitud_palabras: params.longitudPalabras,
    tipo_narrativa: 'cuento',
    dificultad_vocabulario: 'simple',
    estado: true
  });

  // 7. Llamar IA
  let iaResult;
  try {
    iaResult = await generarLecturaConPreguntas({
      edad,
      tema,
      minPalabras: params.minPalabras,
      maxPalabras: params.maxPalabras
    });
  } catch (err) {
    if (err.code === 'ECONNABORTED') throw { status: 504, message: 'Timeout: la IA tardó demasiado' };
    if (err.response) throw { status: 502, message: 'Error al comunicarse con la IA', detalle: err.message };
    throw { status: 502, message: 'Error al procesar respuesta de la IA', detalle: err.message };
  }

  const iaData = iaResult.data;

  // 8. Crear lectura_generada
  const lectura = await LecturasGeneradas.create({
    id: Date.now() + 1,
    titulo: iaData.titulo,
    contenido: iaData.contenido,
    resumen: iaData.resumen,
    parametro_generacion_id: parametro.id,
    estudiante_id,
    grupo_edad_id: grupoEdad.id,
    nivel_lectura: params.nivelLectura,
    temas_abordados: [tema],
    numero_palabras: iaData.numero_palabras,
    tiempo_lectura_estimado: iaData.tiempo_lectura_estimado,
    modelo_ia_usado: process.env.IA_MODEL || (process.env.IA_PROVIDER === 'openai' ? 'gpt-4o-mini' : process.env.IA_PROVIDER === 'gemini' ? 'gemini-1.5-flash' : 'claude-opus-4-5'),
    prompt_generacion: iaResult.prompt,
    estado: 'lista'
  });

  // 9. Crear evaluacion_inicial
  const evaluacion = await EvaluacionesIniciales.create({
    id: Date.now() + 2,
    nombre: `Actividad de lectura - ${tema}`,
    grupo_edad_id: grupoEdad.id,
    numero_preguntas: 5,
    puntuacion_maxima: 5,
    puntuacion_minima: 0,
    estado: true,
    orden_presentacion: 1
  });

  // 10. Crear preguntas y opciones
  const preguntasCreadas = [];
  for (const pIA of iaData.preguntas) {
    const pregunta = await PreguntasEvaluacion.create({
      id: Date.now() + 10 + pIA.orden_pregunta,
      evaluacion_id: evaluacion.id,
      pregunta: pIA.pregunta,
      tipo_pregunta: 'multiple_choice',
      puntuacion: 1,
      orden_pregunta: pIA.orden_pregunta,
      estado: true
    });

    const opcionesCreadas = [];
    for (const oIA of pIA.opciones) {
      const opcion = await OpcionesRespuesta.create({
        id: Date.now() + 100 + pIA.orden_pregunta * 10 + oIA.orden_opcion,
        pregunta_id: pregunta.id,
        texto_opcion: oIA.texto_opcion,
        es_correcta: oIA.es_correcta,
        orden_opcion: oIA.orden_opcion
      });
      opcionesCreadas.push({
        id: opcion.id,
        texto_opcion: opcion.texto_opcion,
        orden_opcion: opcion.orden_opcion
        // NO incluir es_correcta
      });
    }

    preguntasCreadas.push({
      id: pregunta.id,
      pregunta: pregunta.pregunta,
      orden_pregunta: pregunta.orden_pregunta,
      opciones: opcionesCreadas
    });
  }

  // 11. Crear resultado_evaluacion (baseline, sin completar)
  const resultado = await ResultadosEvaluacion.create({
    id: Date.now() + 200,
    estudiante_id,
    evaluacion_id: evaluacion.id,
    puntuacion_total: 0,
    puntuacion_maxima: 5,
    completado: false
  });

  return {
    evaluacion_inicial_id: evaluacion.id,
    resultado_evaluacion_id: resultado.id,
    lectura: {
      id: lectura.id,
      titulo: lectura.titulo,
      contenido: lectura.contenido,
      resumen: lectura.resumen,
      tiempo_lectura_estimado: lectura.tiempo_lectura_estimado
    },
    preguntas: preguntasCreadas
  };
}

async function responderEvaluacion({ resultado_evaluacion_id, respuestas }) {
  const resultado = await ResultadosEvaluacion.findByPk(resultado_evaluacion_id);
  if (!resultado) throw { status: 404, message: 'Resultado de evaluación no encontrado' };
  if (resultado.completado) throw { status: 409, message: 'Esta evaluación ya fue completada' };

  let correctas = 0;

  for (const r of respuestas) {
    const opcion = await OpcionesRespuesta.findByPk(r.opcion_seleccionada_id);
    const esCorrecta = opcion ? opcion.es_correcta === true : false;
    if (esCorrecta) correctas++;

    await RespuestasEstudiante.create({
      id: Date.now() + Math.floor(Math.random() * 9999),
      resultado_evaluacion_id,
      pregunta_id: r.pregunta_id,
      opcion_seleccionada_id: r.opcion_seleccionada_id,
      es_correcta: esCorrecta,
      tiempo_respuesta: r.tiempo_respuesta || null,
      intentos: 1
    });
  }

  const porcentaje = parseFloat(((correctas / 5) * 100).toFixed(2));

  await resultado.update({
    puntuacion_total: correctas,
    porcentaje_aciertos: porcentaje,
    completado: true,
    completado_at: new Date()
  });

  return {
    completado: true,
    puntuacion_total: correctas,
    puntuacion_maxima: 5,
    porcentaje_aciertos: porcentaje
  };
}

async function verificarEvaluacionInicial(estudiante_id) {
  const estudiante = await Estudiantes.findByPk(estudiante_id);
  if (!estudiante) throw { status: 404, message: 'Estudiante no encontrado' };

  const grupoEdad = await GruposEdad.findOne({
    where: db.sequelize.literal(`edad_minima <= ${parseInt(estudiante.edad || 0)} AND edad_maxima >= ${parseInt(estudiante.edad || 0)}`)
  });

  if (!grupoEdad) return { tiene_evaluacion: false };

  const evaluaciones = await EvaluacionesIniciales.findAll({
    where: { grupo_edad_id: grupoEdad.id },
    attributes: ['id']
  });

  if (!evaluaciones.length) return { tiene_evaluacion: false };

  const resultado = await ResultadosEvaluacion.findOne({
    where: {
      estudiante_id,
      evaluacion_id: evaluaciones.map(e => e.id)
    }
  });

  return { tiene_evaluacion: !!resultado };
}

module.exports = { setupEvaluacionInicial, responderEvaluacion, getTemasDisponibles, verificarEvaluacionInicial };
```

- [ ] **Step 2: Verificar sintaxis**

```bash
node -e "require('./services/evaluacionInicialService'); console.log('OK');"
```

Salida esperada: `OK`

- [ ] **Step 3: Commit**

```bash
git add services/evaluacionInicialService.js
git commit -m "feat: add evaluacion inicial orchestrator service"
```

---

## Task 5: Controller

**Files:**
- Modify: `controllers/evaluaciones_inicialesController.js`

- [ ] **Step 1: Implementar el controller**

Reemplazar contenido de `controllers/evaluaciones_inicialesController.js`:

```js
const {
  setupEvaluacionInicial,
  responderEvaluacion,
  getTemasDisponibles,
  verificarEvaluacionInicial
} = require('../services/evaluacionInicialService');

exports.getTemas = async (req, res) => {
  try {
    const { grupo_edad_id } = req.params;
    const id = parseInt(grupo_edad_id, 10);
    if (!Number.isFinite(id)) {
      return res.status(400).json({ success: false, message: 'grupo_edad_id inválido' });
    }
    const temas = await getTemasDisponibles(id);
    return res.status(200).json({ success: true, grupo_edad_id: id, temas });
  } catch (err) {
    const status = err.status || 500;
    return res.status(status).json({ success: false, message: err.message || 'Error interno' });
  }
};

exports.verificarEvaluacion = async (req, res) => {
  try {
    const { estudiante_id } = req.params;
    const id = parseInt(estudiante_id, 10);
    if (!Number.isFinite(id)) {
      return res.status(400).json({ success: false, message: 'estudiante_id inválido' });
    }
    const resultado = await verificarEvaluacionInicial(id);
    return res.status(200).json({ success: true, ...resultado });
  } catch (err) {
    const status = err.status || 500;
    return res.status(status).json({ success: false, message: err.message || 'Error interno' });
  }
};

exports.setup = async (req, res) => {
  try {
    const { estudiante_id, edad, tema } = req.body;

    if (!estudiante_id || !edad || !tema) {
      return res.status(400).json({ success: false, message: 'estudiante_id, edad y tema son requeridos' });
    }

    const edadNum = parseInt(edad, 10);
    if (!Number.isFinite(edadNum) || edadNum < 3 || edadNum > 18) {
      return res.status(400).json({ success: false, message: 'edad debe ser un número entre 3 y 18' });
    }

    if (typeof tema !== 'string' || tema.trim() === '') {
      return res.status(400).json({ success: false, message: 'tema inválido' });
    }

    const resultado = await setupEvaluacionInicial({
      estudiante_id: parseInt(estudiante_id, 10),
      edad: edadNum,
      tema: tema.trim().toLowerCase()
    });

    return res.status(201).json({ success: true, ...resultado });
  } catch (err) {
    const status = err.status || 500;
    return res.status(status).json({ success: false, message: err.message || 'Error interno', detalle: err.detalle });
  }
};

exports.responder = async (req, res) => {
  try {
    const { resultado_evaluacion_id, respuestas } = req.body;

    if (!resultado_evaluacion_id || !Array.isArray(respuestas) || respuestas.length === 0) {
      return res.status(400).json({ success: false, message: 'resultado_evaluacion_id y respuestas[] son requeridos' });
    }

    for (const r of respuestas) {
      if (!r.pregunta_id || !r.opcion_seleccionada_id) {
        return res.status(400).json({ success: false, message: 'Cada respuesta requiere pregunta_id y opcion_seleccionada_id' });
      }
    }

    const resultado = await responderEvaluacion({
      resultado_evaluacion_id: parseInt(resultado_evaluacion_id, 10),
      respuestas
    });

    return res.status(200).json({ success: true, ...resultado });
  } catch (err) {
    const status = err.status || 500;
    return res.status(status).json({ success: false, message: err.message || 'Error interno' });
  }
};
```

- [ ] **Step 2: Verificar sintaxis**

```bash
node -e "require('./controllers/evaluaciones_inicialesController'); console.log('OK');"
```

Salida esperada: `OK`

- [ ] **Step 3: Commit**

```bash
git add controllers/evaluaciones_inicialesController.js
git commit -m "feat: implement evaluaciones iniciales controller"
```

---

## Task 6: Router y montaje en app.js

**Files:**
- Modify: `routes/evaluaciones_inicialesRouter.js`
- Modify: `app.js`

- [ ] **Step 1: Implementar el router**

Reemplazar contenido de `routes/evaluaciones_inicialesRouter.js`:

```js
const express = require('express');
const router = express.Router();
const { verificarToken, verificarEstudiante } = require('../middleware/authMiddleware');
const ctrl = require('../controllers/evaluaciones_inicialesController');

// Pública para el front al momento del registro — solo requiere token
router.get('/temas/:grupo_edad_id', verificarToken, ctrl.getTemas);
router.get('/verificar/:estudiante_id', verificarToken, ctrl.verificarEvaluacion);
router.post('/setup', verificarToken, ctrl.setup);
router.post('/responder', verificarToken, ctrl.responder);

module.exports = router;
```

- [ ] **Step 2: Montar en app.js**

En `app.js`, agregar después de la línea `var reportesRoutes = require('./routes/reportesRouter');`:

```js
var evaluacionesInicialesRoutes = require('./routes/evaluaciones_inicialesRouter');
```

Y después de `app.use('/reportes', reportesRoutes);`:

```js
app.use('/evaluacion-inicial', evaluacionesInicialesRoutes);
```

- [ ] **Step 3: Verificar que el servidor arranca**

```bash
node -e "require('./app'); console.log('app OK');"
```

Salida esperada: `app OK`

- [ ] **Step 4: Commit**

```bash
git add routes/evaluaciones_inicialesRouter.js app.js
git commit -m "feat: mount evaluacion-inicial routes in express app"
```

---

## Task 7: Prueba manual end-to-end

- [ ] **Step 1: Arrancar el servidor**

```bash
npm start
```

- [ ] **Step 2: Probar GET temas**

```bash
curl -X GET http://localhost:3000/evaluacion-inicial/temas/1 \
  -H "Authorization: Bearer <token_estudiante>"
```

Respuesta esperada:
```json
{ "success": true, "grupo_edad_id": 1, "temas": ["animales", "naturaleza", ...] }
```

- [ ] **Step 3: Probar POST setup**

```bash
curl -X POST http://localhost:3000/evaluacion-inicial/setup \
  -H "Authorization: Bearer <token_estudiante>" \
  -H "Content-Type: application/json" \
  -d '{ "estudiante_id": 1, "edad": 8, "tema": "animales" }'
```

Respuesta esperada (201):
```json
{
  "success": true,
  "evaluacion_inicial_id": ...,
  "resultado_evaluacion_id": ...,
  "lectura": { "titulo": "...", "contenido": "...", ... },
  "preguntas": [ { "id": ..., "pregunta": "...", "opciones": [...] } ]
}
```

Verificar que `es_correcta` NO aparece en las opciones del response.

- [ ] **Step 4: Probar POST responder**

```bash
curl -X POST http://localhost:3000/evaluacion-inicial/responder \
  -H "Authorization: Bearer <token_estudiante>" \
  -H "Content-Type: application/json" \
  -d '{
    "resultado_evaluacion_id": <id_del_paso_anterior>,
    "respuestas": [
      { "pregunta_id": <id1>, "opcion_seleccionada_id": <opcion_id>, "tiempo_respuesta": 10 },
      { "pregunta_id": <id2>, "opcion_seleccionada_id": <opcion_id>, "tiempo_respuesta": 8 },
      { "pregunta_id": <id3>, "opcion_seleccionada_id": <opcion_id>, "tiempo_respuesta": 15 },
      { "pregunta_id": <id4>, "opcion_seleccionada_id": <opcion_id>, "tiempo_respuesta": 12 },
      { "pregunta_id": <id5>, "opcion_seleccionada_id": <opcion_id>, "tiempo_respuesta": 9 }
    ]
  }'
```

Respuesta esperada (200):
```json
{
  "success": true,
  "completado": true,
  "puntuacion_total": <0-5>,
  "puntuacion_maxima": 5,
  "porcentaje_aciertos": <0-100>
}
```

- [ ] **Step 5: Probar doble registro (debe dar 409)**

Repetir el POST setup con el mismo `estudiante_id`. Respuesta esperada:
```json
{ "success": false, "message": "El estudiante ya completó la evaluación inicial" }
```

- [ ] **Step 6: Commit final**

```bash
git add .
git commit -m "feat: evaluacion inicial completa - lectura IA + preguntas + respuestas"
```

---

## Checklist de cobertura del spec

- [x] GET temas por grupo_edad_id
- [x] GET verificar si estudiante ya tiene evaluación
- [x] POST setup: validación de inputs
- [x] POST setup: lookup grupo_edad por edad
- [x] POST setup: validación de tema según grupo
- [x] POST setup: guard 409 si ya existe evaluación
- [x] POST setup: crear parametros_generacion_lectura
- [x] POST setup: llamada IA con timeout 45s
- [x] POST setup: errores 502/504 de IA
- [x] POST setup: crear lecturas_generadas
- [x] POST setup: crear evaluaciones_iniciales
- [x] POST setup: crear preguntas_evaluacion
- [x] POST setup: crear opciones_respuesta
- [x] POST setup: crear resultados_evaluacion (baseline)
- [x] POST setup: response sin es_correcta
- [x] POST responder: guardar respuestas_estudiante
- [x] POST responder: calcular puntuacion y porcentaje
- [x] POST responder: update resultados_evaluacion con completado
- [x] Soporte multi-proveedor IA (claude/openai/gemini)
- [x] Validación estructura respuesta IA (5 preguntas, 4 opciones, 1 correcta)
