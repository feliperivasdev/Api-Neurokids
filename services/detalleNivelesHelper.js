/**
 * Fusiona `detalle_niveles` (JSON) con cada guardado de progreso.
 * - Juegos (tipo 2): hasta 3 niveles; puntos por nivel acumulables (suma en `puntuacion`).
 * - Lecturas (tipo 1): lectura en bloque (`completado: true`) o por niveles (1–3) como los juegos.
 */

const MAX_LEVELS = 3;

function clampLevel(n) {
  const x = parseInt(n, 10);
  if (!Number.isFinite(x)) return 1;
  return Math.min(MAX_LEVELS, Math.max(1, x));
}

function readDetalleFromRow(existingRow) {
  if (!existingRow) return null;
  if (typeof existingRow.get === 'function') {
    return existingRow.get('detalle_niveles');
  }
  return existingRow.detalle_niveles;
}

function normalize(prevRaw) {
  if (!prevRaw || typeof prevRaw !== 'object') {
    return {
      levelScores: {},
      levelsCompleted: [],
      maxLevelReached: 0,
      lecturaSimple: false
    };
  }
  const levelScores = { ...(prevRaw.levelScores || {}) };
  Object.keys(levelScores).forEach((k) => {
    levelScores[k] = Number(levelScores[k]) || 0;
  });
  let levelsCompleted = Array.isArray(prevRaw.levelsCompleted)
    ? prevRaw.levelsCompleted.map((x) => clampLevel(x)).filter((x, i, a) => a.indexOf(x) === i)
    : [];
  levelsCompleted.sort((a, b) => a - b);
  return {
    levelScores,
    levelsCompleted,
    maxLevelReached: Number(prevRaw.maxLevelReached) || 0,
    lecturaSimple: Boolean(prevRaw.lecturaSimple)
  };
}

function sumLevelScores(levelScores) {
  let s = 0;
  for (let i = 1; i <= MAX_LEVELS; i += 1) {
    s += Number(levelScores[i] || 0);
  }
  return s;
}

function allGameLevelsDone(levelsCompleted) {
  return [1, 2, 3].every((l) => levelsCompleted.includes(l));
}

/**
 * @param {object|null} existingRow - instancia Sequelize o { detalle_niveles }
 * @param {object} body - req.body
 * @param {object} actividad - modelo Actividades
 * @returns {{ merged: object, totalScore: number, activityComplete: boolean }}
 */
function mergeDetalleNiveles(existingRow, body, actividad) {
  const prev = normalize(readDetalleFromRow(existingRow));
  const rowCompletado =
    existingRow &&
    (typeof existingRow.get === 'function'
      ? existingRow.get('completado')
      : existingRow.completado);
  const tipoLectura = Number(actividad.tipo_actividad_id) === 1;
  const tipoJuego = Number(actividad.tipo_actividad_id) === 2;

  const puntuacion = parseInt(body.puntuacion, 10);
  const punt = Number.isFinite(puntuacion) ? puntuacion : 0;
  const nivel = clampLevel(body.nivel != null ? body.nivel : body.level);
  const soloRegistro = body.solo_registro === true || body.solo_registro === 'true';
  const nivelCompletado = body.nivel_completado === true || body.nivel_completado === 'true';
  const completadoCliente = body.completado === true || body.completado === 'true';
  /** Compat: juegos antiguos enviaban solo `completado: true` al pasar cada nivel */
  const nivelCompletadoLegacy =
    tipoJuego && completadoCliente && !soloRegistro;
  const nivelCompletadoFlag = nivelCompletado || nivelCompletadoLegacy;

  if (tipoLectura) {
    prev.lecturaSimple = true;
    if (soloRegistro) {
      prev.maxLevelReached = Math.max(prev.maxLevelReached || 0, nivel);
      const complete =
        allGameLevelsDone(prev.levelsCompleted) || Boolean(rowCompletado);
      return {
        merged: prev,
        totalScore: sumLevelScores(prev.levelScores) || punt,
        activityComplete: complete
      };
    }
    if (completadoCliente) {
      prev.levelScores = { 1: punt };
      prev.levelsCompleted = [1, 2, 3];
      prev.maxLevelReached = MAX_LEVELS;
      return {
        merged: prev,
        totalScore: punt,
        activityComplete: true
      };
    }
    /** Lectura por niveles (readingLevelFinished): acumula niveles como en juegos. */
    if (nivelCompletado) {
      prev.levelScores[nivel] = Math.max(Number(prev.levelScores[nivel] || 0), punt);
      if (!prev.levelsCompleted.includes(nivel)) {
        prev.levelsCompleted.push(nivel);
      }
      prev.levelsCompleted.sort((a, b) => a - b);
    }
    prev.maxLevelReached = Math.max(prev.maxLevelReached || 0, nivel);
    const totalLectura = sumLevelScores(prev.levelScores) || punt;
    const lecturaCompletaPorNiveles = allGameLevelsDone(prev.levelsCompleted);
    return {
      merged: prev,
      totalScore: totalLectura,
      activityComplete: lecturaCompletaPorNiveles
    };
  }

  if (tipoJuego) {
    prev.lecturaSimple = false;
    if (soloRegistro) {
      prev.maxLevelReached = Math.max(prev.maxLevelReached || 0, nivel);
      /** No bajar a no-completado si otra petición ya marcó la actividad (evita carrera con fin de nivel). */
      const complete =
        allGameLevelsDone(prev.levelsCompleted) || Boolean(rowCompletado);
      return {
        merged: prev,
        totalScore: sumLevelScores(prev.levelScores),
        activityComplete: complete
      };
    }
    if (nivelCompletadoFlag) {
      prev.levelScores[nivel] = Math.max(Number(prev.levelScores[nivel] || 0), punt);
      if (!prev.levelsCompleted.includes(nivel)) {
        prev.levelsCompleted.push(nivel);
      }
      prev.levelsCompleted.sort((a, b) => a - b);
    }
    prev.maxLevelReached = Math.max(prev.maxLevelReached || 0, nivel);

    const totalScore = sumLevelScores(prev.levelScores);
    const activityComplete = allGameLevelsDone(prev.levelsCompleted);

    return {
      merged: prev,
      totalScore,
      activityComplete
    };
  }

  /* Otros tipos: tratar como juego */
  prev.maxLevelReached = Math.max(prev.maxLevelReached || 0, nivel);
  return {
    merged: prev,
    totalScore: punt || sumLevelScores(prev.levelScores),
    activityComplete: Boolean(completadoCliente)
  };
}

function puntuacionMaximaEsperada(actividad) {
  const per = Number(actividad.puntuacion_maxima) || 100;
  if (Number(actividad.tipo_actividad_id) === 2) {
    return per * MAX_LEVELS;
  }
  return per;
}

module.exports = {
  mergeDetalleNiveles,
  puntuacionMaximaEsperada,
  MAX_LEVELS
};
