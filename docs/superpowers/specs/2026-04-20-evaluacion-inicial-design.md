# Evaluación Inicial — Spec de Diseño

## Contexto

Neurokids es una plataforma educativa para niños con dislexia. Al primer ingreso del estudiante, se le muestra una selección de temas de forma natural (sin llamarla "examen"). El backend genera una lectura adaptada a su edad + tema usando IA, y la presenta como actividad de comprensión lectora. Esto establece el baseline diagnóstico para comparar con evaluaciones posteriores.

**Restricción:** El contenido generado nunca debe mencionar dislexia, terapias ni condiciones médicas.

---

## Flujo de usuario

1. Estudiante se registra → recibe insignia de primer registro
2. Inmediatamente se le presentan los temas disponibles (GET temas)
3. Estudiante selecciona un tema → front muestra pantalla de carga
4. Backend genera lectura + preguntas vía IA (una sola llamada)
5. Front muestra lectura y preguntas de comprensión
6. Estudiante responde → se guardan en `respuestas_estudiante`
7. Estudiante puede acceder al resto de la plataforma

---

## Endpoints

### GET `/evaluacion-inicial/temas/:grupo_edad_id`

Retorna lista hardcoded de temas según grupo de edad.

**Response 200:**
```json
{
  "grupo_edad_id": 2,
  "temas": ["animales", "naturaleza", "familia", "aventura", "deportes", "ciencia", "arte", "música"]
}
```

### GET `/evaluacion-inicial/verificar/:estudiante_id`

Verifica si el estudiante ya completó evaluación inicial.

**Response 200:**
```json
{ "tiene_evaluacion": false }
```

### POST `/evaluacion-inicial/setup`

Genera lectura + preguntas vía IA y crea todos los registros necesarios.

**Request:**
```json
{ "estudiante_id": 42, "edad": 8, "tema": "animales" }
```

**Response 201:**
```json
{
  "evaluacion_inicial_id": 5,
  "resultado_evaluacion_id": 12,
  "lectura": {
    "id": 33,
    "titulo": "El viaje del delfín",
    "contenido": "...",
    "resumen": "...",
    "tiempo_lectura_estimado": 4
  },
  "preguntas": [
    {
      "id": 101,
      "pregunta": "¿Adónde viajó el delfín?",
      "orden_pregunta": 1,
      "opciones": [
        { "id": 401, "texto_opcion": "Al río", "orden_opcion": 1 },
        { "id": 402, "texto_opcion": "Al mar", "orden_opcion": 2 },
        { "id": 403, "texto_opcion": "Al lago", "orden_opcion": 3 },
        { "id": 404, "texto_opcion": "A la montaña", "orden_opcion": 4 }
      ]
    }
  ]
}
```
> `es_correcta` NO se incluye en el response.

### POST `/evaluacion-inicial/responder`

Guarda las respuestas del estudiante tras completar la evaluación.

**Request:**
```json
{
  "resultado_evaluacion_id": 12,
  "respuestas": [
    { "pregunta_id": 101, "opcion_seleccionada_id": 402, "tiempo_respuesta": 12 }
  ]
}
```

**Response 200:**
```json
{
  "completado": true,
  "puntuacion_total": 4,
  "puntuacion_maxima": 5,
  "porcentaje_aciertos": 80.0
}
```

---

## Errores manejados

| Código | Causa |
|--------|-------|
| 400 | Tema inválido para el grupo de edad |
| 400 | edad/estudiante_id/tema ausentes o inválidos |
| 404 | Estudiante no encontrado |
| 404 | grupo_edad no encontrado para la edad dada |
| 409 | Estudiante ya tiene evaluación inicial |
| 502 | Fallo en API de IA (respuesta no parseable o error HTTP) |
| 504 | Timeout IA (>45s) |

---

## Flujo de inserción en BD

```
POST /evaluacion-inicial/setup

1. grupos_edad WHERE edad_minima <= edad AND edad_maxima >= edad
   → grupo_edad_id, nivel_lectura, longitud_palabras

2. Verificar no existe resultados_evaluacion para estudiante con evaluacion que pertenezca a mismo grupo_edad
   → 409 si ya existe

3. INSERT parametros_generacion_lectura
   { nombre: `Param-${estudiante_id}-${tema}`,
     grupo_edad_id, nivel_lectura, temas_preferidos: [tema],
     longitud_palabras, tipo_narrativa: 'cuento',
     dificultad_vocabulario: 'simple', estado: true }
   → parametro_id

4. LLAMADA IA (una sola vez)
   → { titulo, contenido, resumen, numero_palabras,
       tiempo_lectura_estimado, preguntas[5] }

5. INSERT lecturas_generadas
   { titulo, contenido, resumen, parametro_generacion_id,
     estudiante_id, grupo_edad_id, nivel_lectura,
     temas_abordados: [tema], numero_palabras,
     tiempo_lectura_estimado, modelo_ia_usado, prompt_generacion,
     estado: 'lista', generada_por_ia: true }  (campo en model como boolean)
   → lectura_id

   NOTA: lecturas_generadas no tiene generada_por_ia en el modelo actual,
   se omite ese campo (es implícito por la tabla).

6. INSERT evaluaciones_iniciales
   { nombre: `Actividad de lectura - ${tema}`,
     grupo_edad_id, numero_preguntas: 5,
     puntuacion_maxima: 5, puntuacion_minima: 0, estado: true }
   → evaluacion_id

7. Por cada pregunta (5):
   INSERT preguntas_evaluacion
   { evaluacion_id, pregunta, tipo_pregunta: 'multiple_choice',
     puntuacion: 1, orden_pregunta }
   → pregunta_id

   Por cada opción (4 por pregunta):
   INSERT opciones_respuesta
   { pregunta_id, texto_opcion, es_correcta, orden_opcion }
   → opcion_id

8. INSERT resultados_evaluacion
   { estudiante_id, evaluacion_id,
     puntuacion_total: 0, puntuacion_maxima: 5,
     completado: false }
   → resultado_id

RESPONSE 201 con datos de lectura + preguntas (sin es_correcta)
```

```
POST /evaluacion-inicial/responder

1. Buscar resultados_evaluacion por id → verificar pertenece al estudiante
2. Por cada respuesta:
   - Buscar opcion_seleccionada en opciones_respuesta → leer es_correcta
   - INSERT respuestas_estudiante
     { resultado_evaluacion_id, pregunta_id, opcion_seleccionada_id,
       es_correcta, tiempo_respuesta, intentos: 1 }
3. Calcular puntuacion_total = COUNT WHERE es_correcta = true
4. UPDATE resultados_evaluacion
   { puntuacion_total, porcentaje_aciertos,
     completado: true, completado_at: now() }
5. RESPONSE 200 con resultado
```

---

## Configuración de temas (hardcoded)

```js
// config/temas.js
const TEMAS_POR_GRUPO = {
  // Aplica a todos los grupos
  base: ['animales', 'naturaleza', 'familia', 'aventura', 'deportes', 'ciencia', 'arte', 'música'],
  // Grupos mayores (edad_minima >= 9) añaden:
  avanzado: ['historia', 'tecnología', 'medio ambiente']
};
```

---

## Parámetros de generación por edad

| Edad  | Palabras  | nivel_lectura | longitud_palabras |
|-------|-----------|---------------|-------------------|
| 5-6   | 80-120    | básico        | corta             |
| 7-8   | 120-180   | básico        | media             |
| 9-10  | 180-250   | intermedio    | media             |
| 11-12 | 250-350   | intermedio    | larga             |

---

## Prompt de IA

```
Eres un especialista en literacidad infantil. Crea material de lectura y comprensión
para un niño de {edad} años sobre el tema "{tema}".

REGLAS ESTRICTAS DEL TEXTO:
- Oraciones de máximo 8 palabras
- Una idea por oración
- Párrafos de máximo 3 oraciones
- Vocabulario cotidiano, sin tecnicismos
- Sin metáforas, refranes ni ironía
- Sin referencias a dificultades de aprendizaje, terapias o condiciones médicas
- Entre {min_palabras} y {max_palabras} palabras en total
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
}
```

---

## Wrapper de IA (iaGeneracionService.js)

Soporta tres proveedores seleccionables por env var:

```
IA_PROVIDER=claude|openai|gemini
IA_API_KEY=<key>
IA_MODEL=<model-id-opcional>
```

El servicio expone una sola función: `generarLecturaConPreguntas({ edad, tema, grupoEdad })` que retorna el objeto JSON parseado o lanza error.

---

## Archivos a crear/modificar

| Archivo | Acción |
|---------|--------|
| `config/temas.js` | Crear — temas hardcoded |
| `services/iaGeneracionService.js` | Crear — wrapper IA multi-proveedor |
| `services/evaluacionInicialService.js` | Crear — orquestador |
| `controllers/evaluaciones_inicialesController.js` | Implementar (vacío actualmente) |
| `routes/evaluaciones_iniciales.js` | Implementar (vacío actualmente) |
| `app.js` | Modificar — montar ruta `/evaluacion-inicial` |
| `.example.env` | Modificar — agregar IA_PROVIDER, IA_API_KEY, IA_MODEL |
