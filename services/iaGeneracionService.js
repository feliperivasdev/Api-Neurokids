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
