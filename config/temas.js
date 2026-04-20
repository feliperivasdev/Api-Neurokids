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
  if (edad < 5)  return PARAMS_POR_EDAD['5-6'];
  return PARAMS_POR_EDAD['11-12'];
}

function getTemasParaGrupo(edadMinima) {
  if (edadMinima >= 9) return [...TEMAS_BASE, ...TEMAS_AVANZADOS];
  return [...TEMAS_BASE];
}

function esTemaValido(tema, edadMinima) {
  return getTemasParaGrupo(edadMinima).includes(tema);
}

module.exports = { getParamsPorEdad, getTemasParaGrupo, esTemaValido };
