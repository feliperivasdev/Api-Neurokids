

const db = require('../models');
const AccesosPlataformaEstudiante = db.accesos_plataforma_estudiante_model;
const LogrosEstudiante = db.logros_estudiante_model;

function calcularRachaDiasDesdeAccesos(fechaHoraRows) {
  const days = new Set();
  (fechaHoraRows || []).forEach((row) => {
    const raw = row.fecha_hora != null ? row.fecha_hora : row.fecha;
    if (!raw) return;
    const d = new Date(raw);
    if (Number.isNaN(d.getTime())) return;
    d.setHours(0, 0, 0, 0);
    days.add(d.getTime());
  });
  if (days.size === 0) return 0;
  const sorted = [...days].sort((a, b) => b - a);
  let streak = 1;
  let prev = sorted[0];
  for (let i = 1; i < sorted.length; i++) {
    if (prev - sorted[i] === 86400000) {
      streak++;
      prev = sorted[i];
    } else {
      break;
    }
  }
  return streak;
}


async function sincronizarRachaDesdeAccesos(estudianteIdNum) {
  const rows = await AccesosPlataformaEstudiante.findAll({
    where: { estudiante_id: estudianteIdNum },
    attributes: ['fecha_hora'],
    raw: true
  });
  const streak = calcularRachaDiasDesdeAccesos(rows);
  const ahora = new Date();
  let logros = await LogrosEstudiante.findOne({ where: { estudiante_id: estudianteIdNum } });
  const maxPrev = logros ? Number(logros.racha_dias_maxima) || 0 : 0;
  const nuevoMax = Math.max(maxPrev, streak);

  if (!logros) {
    await LogrosEstudiante.create({
      estudiante_id: estudianteIdNum,
      racha_dias_actual: streak,
      racha_dias_maxima: nuevoMax,
      puntos_totales: 0,
      insignias_totales: 0,
      created_at: ahora,
      updated_at: ahora
    });
  } else {
    await logros.update({
      racha_dias_actual: streak,
      racha_dias_maxima: nuevoMax,
      updated_at: ahora
    });
  }
  return { streak, racha_dias_maxima: nuevoMax };
}

module.exports = {
  calcularRachaDiasDesdeAccesos,
  sincronizarRachaDesdeAccesos
};
