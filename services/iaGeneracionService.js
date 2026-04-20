const axios = require('axios');

const PROVIDER = process.env.IA_PROVIDER || 'claude';
const API_KEY = process.env.IA_API_KEY;
const MODEL = process.env.IA_MODEL;

function buildPrompt(edad, tema, minPalabras, maxPalabras) {
  return `Eres un especialista en educación inclusiva y literacidad infantil. Crea una lectura enganchante y coherente para un niño de ${edad} años sobre el tema "${tema}".

IMPORTANTE: Este texto será leído por niños con dislexia. Debe ser:
✓ Coherente y narrativamente interesante (no primitivo)
✓ Accesible: oraciones claras con estructura sujeto-verbo-objeto
✓ Palabra por palabra comprensible, sin saltos conceptuales abruptos

REGLAS DEL TEXTO:
- Oraciones: máximo 12 palabras (pueden ser 6-12, según necesidad de coherencia)
- Una idea principal por oración, con máximo una subordinada simple
- Párrafos cortos (2-3 oraciones), con saltos de línea visibles
- Vocabulario: cotidiano pero no condescendiente (usa palabras reales de edad ${edad})
- PERMITIDO: conectores simples (y, pero, porque, entonces, cuando)
- PROHIBIDO: metáforas, comparaciones complejas, ironía, humor implícito
- Sin referencias médicas, terapéuticas o de "dificultades"
- Historia con inicio claro, desarrollo coherente, desenlace satisfactorio
- Entre ${minPalabras} y ${maxPalabras} palabras en total
- Ritmo: intercala oraciones cortas con un poco más largas (pero siempre claras)

REGLAS DE PREGUNTAS DE COMPRENSIÓN:
- Exactamente 5 preguntas progresivas (fácil → difícil)
- Opción múltiple, 4 opciones cada una
- Solo 1 respuesta correcta por pregunta
- Opciones: máximo 8 palabras (pero natural)
- Pregunta 1-2: recuperación directa del texto
- Pregunta 3-4: orden de eventos o relaciones simples
- Pregunta 5: deducción simple (causa-efecto obvio)
- Sin "¿cuál NO es..." ni preguntas negativas
- Las opciones incorrectas deben ser plausibles pero claramente distintas

ESTRUCTURA ESPERADA DEL JSON:
{
  "titulo": "string (máximo 6 palabras, interesante)",
  "contenido": "string (la lectura completa, formateada con saltos de línea)",
  "resumen": "string (máximo 2 oraciones para docentes)",
  "numero_palabras": number,
  "tiempo_lectura_estimado": number (en minutos),
  "preguntas": [
    {
      "pregunta": "string",
      "orden_pregunta": number (1-5),
      "opciones": [
        { "texto_opcion": "string", "es_correcta": false, "orden_opcion": 1 },
        { "texto_opcion": "string", "es_correcta": true,  "orden_opcion": 2 },
        { "texto_opcion": "string", "es_correcta": false, "orden_opcion": 3 },
        { "texto_opcion": "string", "es_correcta": false, "orden_opcion": 4 }
      ]
    }
  ]
}

Responde ÚNICAMENTE con JSON válido. Sin texto antes ni después. Sin markdown.`;
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

async function llamarGroq(prompt) {
  const model = MODEL || 'llama-3-8b-8192';
  try {
    const resp = await axios.post(
      'https://api.groq.com/openai/v1/chat/completions',
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
  } catch (err) {
    if (err.response?.data) {
      console.error('Error detallado de Groq:', JSON.stringify(err.response.data));
    }
    throw err;
  }
}

async function llamarGemini(prompt) {
  const model = MODEL || 'gemini-2.0-flash';
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
  try {
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
  } catch (err) {
    console.error('Error al parsear respuesta IA:', err.message, 'Texto recibido:', texto?.substring(0, 200));
    throw err;
  }
}

async function generarLecturaConPreguntas({ edad, tema, minPalabras, maxPalabras }) {
  if (!API_KEY) throw new Error('IA_API_KEY no configurada en variables de entorno');

  const prompt = buildPrompt(edad, tema, minPalabras, maxPalabras);
  let textoRespuesta;

  try {
    if (PROVIDER === 'openai') {
      textoRespuesta = await llamarOpenAI(prompt);
    } else if (PROVIDER === 'gemini') {
      textoRespuesta = await llamarGemini(prompt);
    } else if (PROVIDER === 'groq') {
      textoRespuesta = await llamarGroq(prompt);
    } else {
      textoRespuesta = await llamarClaude(prompt);
    }
  } catch (err) {
    console.error(`Error en proveedor IA ${PROVIDER}:`, err.message);
    throw err;
  }

  return { data: parsearRespuestaIA(textoRespuesta), prompt };
}

module.exports = { generarLecturaConPreguntas };
