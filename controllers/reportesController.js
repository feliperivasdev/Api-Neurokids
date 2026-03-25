const { Op } = require('sequelize');
const db = require('../models');
const Estudiantes = db.estudiantes_model;
const Institucion = db.instituciones_model;
const ProgresoActividades = db.progreso_actividades_model;
const SesionesActividad = db.sesiones_actividad_model;
const Actividades = db.actividades_model;
const GruposEdad = db.grupos_edad_model;
const InsigniasEstudiante = db.insignias_estudiante_model;
const Insignias = db.insignias_model;

function calcularRachaDias(sesionesRows) {
  const days = new Set();
  (sesionesRows || []).forEach((s) => {
    if (!s.fecha) return;
    const d = new Date(s.fecha);
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

function armarResumen({ actividadesDetalladas, estudiante, insigniasDetalladas, sesionesAll }) {
  let puntos_totales = 0;
  let lecturas_completadas = 0;
  let juegos_completados = 0;
  let respuestas_correctas = 0;
  let respuestas_incorrectas = 0;
  actividadesDetalladas.forEach((p) => {
    puntos_totales += Number(p.puntuacion || 0);
    if (p.completado) {
      if (p.tipo_actividad_id === 1) lecturas_completadas++;
      if (p.tipo_actividad_id === 2) juegos_completados++;
    }
    respuestas_correctas += Number(p.respuestas_correctas || 0);
    respuestas_incorrectas += Number(p.respuestas_incorrectas || 0);
  });
  const totalResp = respuestas_correctas + respuestas_incorrectas;
  const precision_pct = totalResp > 0 ? Math.round((respuestas_correctas / totalResp) * 100) : null;
  const racha_dias = calcularRachaDias(sesionesAll);
  const insignias_obtenidas = insigniasDetalladas.filter((i) => i.completado).length;
  let nivel_etapa = '—';
  const edad = estudiante.edad != null ? Number(estudiante.edad) : null;
  if (edad != null && !Number.isNaN(edad)) {
    if (edad >= 7 && edad <= 8) nivel_etapa = '7-8 años';
    else if (edad >= 9 && edad <= 10) nivel_etapa = '9-10 años';
    else if (edad >= 11 && edad <= 12) nivel_etapa = '11-12 años';
  }
  return {
    puntos_totales,
    lecturas_completadas,
    juegos_completados,
    respuestas_correctas,
    precision_pct,
    racha_dias,
    insignias_obtenidas,
    nivel_etapa
  };
}

async function buildReporteDetalleData(estudiante_id, query) {
  const { fecha_desde, fecha_hasta } = query || {};

  const est = await Estudiantes.findByPk(estudiante_id, {
    include: [{ model: Institucion, as: 'institucion', attributes: ['nombre'] }],
    attributes: ['id', 'nombre', 'apellido', 'edad', 'institucion_id']
  });

  if (!est) {
    return { notFound: true };
  }

  const progresos = await ProgresoActividades.findAll({
    where: { estudiante_id },
    include: [
      {
        model: Actividades,
        as: 'actividad',
        attributes: [
          'id',
          'nombre',
          'tipo_actividad_id',
          'grupo_edad_id',
          'nivel',
          'puntuacion_maxima'
        ]
      }
    ],
    order: [['ultima_interaccion', 'DESC']]
  });

  const sesionesWhere = { estudiante_id };
  if (fecha_desde && fecha_hasta) {
    sesionesWhere.fecha = { [Op.between]: [new Date(fecha_desde), new Date(fecha_hasta)] };
  } else if (fecha_desde) {
    sesionesWhere.fecha = { [Op.gte]: new Date(fecha_desde) };
  } else if (fecha_hasta) {
    sesionesWhere.fecha = { [Op.lte]: new Date(fecha_hasta) };
  }

  const sesiones = await SesionesActividad.findAll({
    where: sesionesWhere,
    order: [['fecha', 'DESC']],
    raw: true
  });

  const sesionesAll = await SesionesActividad.findAll({
    where: { estudiante_id },
    attributes: ['fecha'],
    raw: true
  });

  const sesionesPorActividad = {};
  const sesionesPorActividadId = {};
  sesiones.forEach((s) => {
    const key = `${s.estudiante_id}-${s.actividad_id}`;
    const sesionData = {
      fecha: s.fecha ? (s.fecha instanceof Date ? s.fecha.toISOString() : String(s.fecha)) : null,
      duracion_seg: s.duracion_seg ?? 0,
      completado: Boolean(s.completado),
      respuestas_correctas: s.respuestas_correctas ?? 0,
      respuestas_incorrectas: s.respuestas_incorrectas ?? 0,
      uso_audio: s.uso_audio ?? 0,
      nivel: s.nivel ?? 1,
      puntuacion: s.puntuacion ?? 0,
      puntuacion_maxima: s.puntuacion_maxima ?? 100
    };
    if (!sesionesPorActividad[key]) sesionesPorActividad[key] = [];
    sesionesPorActividad[key].push(sesionData);
    const aid = Number(s.actividad_id);
    if (!sesionesPorActividadId[aid]) sesionesPorActividadId[aid] = [];
    sesionesPorActividadId[aid].push(sesionData);
  });

  const actividadesDetalladas = progresos.map((p) => {
    const key = `${p.estudiante_id}-${p.actividad_id}`;
    return {
      actividad_id: p.actividad_id,
      nombre: p.actividad?.nombre,
      tipo_actividad_id: p.actividad?.tipo_actividad_id,
      grupo_edad_id: p.actividad?.grupo_edad_id,
      nivel: p.actividad?.nivel,
      puntuacion: p.puntuacion,
      puntuacion_maxima: p.puntuacion_maxima,
      completado: p.completado,
      intentos: p.intentos,
      tiempo_total: p.tiempo_total,
      respuestas_correctas: p.respuestas_correctas ?? 0,
      respuestas_incorrectas: p.respuestas_incorrectas ?? 0,
      uso_audio: p.uso_audio ?? 0,
      ultima_interaccion: p.ultima_interaccion,
      sesiones: sesionesPorActividad[key] || []
    };
  });

  const edad = est.edad != null ? Number(est.edad) : null;
  let grupoIdsFiltro = [];
  if (edad != null) {
    const grupos = await GruposEdad.findAll({
      where: {
        edad_minima: { [Op.lte]: edad },
        edad_maxima: { [Op.gte]: edad }
      },
      attributes: ['id'],
      raw: true
    });
    grupoIdsFiltro = grupos.map((g) => g.id);
  }
  const whereCatalogo = { tipo_actividad_id: 1 };
  if (grupoIdsFiltro.length > 0) {
    whereCatalogo.grupo_edad_id = { [Op.in]: grupoIdsFiltro };
  }
  const catalogoLecturas = await Actividades.findAll({
    where: whereCatalogo,
    attributes: ['id', 'nombre', 'tipo_actividad_id', 'grupo_edad_id', 'nivel'],
    order: [['grupo_edad_id', 'ASC'], ['orden_presentacion', 'ASC']],
    raw: true
  });
  const whereJuegos = { tipo_actividad_id: 2 };
  if (grupoIdsFiltro.length > 0) {
    whereJuegos.grupo_edad_id = { [Op.in]: grupoIdsFiltro };
  }
  const catalogoJuegos = await Actividades.findAll({
    where: whereJuegos,
    attributes: ['id', 'nombre', 'tipo_actividad_id', 'grupo_edad_id', 'nivel'],
    order: [['grupo_edad_id', 'ASC'], ['orden_presentacion', 'ASC']],
    raw: true
  });

  const insignias = await InsigniasEstudiante.findAll({
    where: { estudiante_id },
    include: [
      {
        model: Insignias,
        as: 'insignia',
        attributes: ['id', 'nombre', 'descripcion', 'icono', 'color_hex']
      },
      {
        model: Actividades,
        as: 'actividad',
        attributes: ['id', 'nombre', 'tipo_actividad_id', 'grupo_edad_id', 'nivel']
      }
    ],
    attributes: [
      'id',
      'insignia_id',
      'actividad_origen_id',
      'progreso_actual',
      'progreso_requerido',
      'completado',
      'obtenido_at'
    ],
    order: [['obtenido_at', 'DESC']]
  });

  const insigniasDetalladas = insignias.map((i) => ({
    id: i.id,
    insignia_id: i.insignia_id,
    nombre: i.insignia?.nombre,
    descripcion: i.insignia?.descripcion,
    icono: i.insignia?.icono,
    color_hex: i.insignia?.color_hex,
    actividad_origen_id: i.actividad_origen_id,
    actividad: i.actividad
      ? {
          id: i.actividad.id,
          nombre: i.actividad.nombre,
          tipo_actividad_id: i.actividad.tipo_actividad_id,
          grupo_edad_id: i.actividad.grupo_edad_id,
          nivel: i.actividad.nivel
        }
      : null,
    progreso_actual: i.progreso_actual,
    progreso_requerido: i.progreso_requerido,
    completado: i.completado,
    obtenido_at: i.obtenido_at
  }));

  const estudiantePayload = {
    id: est.id,
    nombre: est.nombre,
    apellido: est.apellido,
    edad: est.edad,
    institucion_id: est.institucion_id,
    institucion: est.institucion?.nombre
  };

  const resumen = armarResumen({
    actividadesDetalladas,
    estudiante: est,
    insigniasDetalladas,
    sesionesAll
  });

  return {
    success: true,
    data: {
      estudiante: estudiantePayload,
      actividades: actividadesDetalladas,
      sesionesPorActividadId,
      insignias: insigniasDetalladas,
      catalogoLecturas,
      catalogoJuegos,
      resumen
    }
  };
}

// GET /reportes/estudiantes
// Docente: solo su institución. Admin: todas o por query institucion_id
exports.reporteEstudiantes = async (req, res) => {
  try {
    const { institucion_id: queryInstitucionId } = req.query;
    const esAdmin = req.usuario?.rol_id === 1 || req.usuario?.rol_nombre === 'administrador';

    const whereEstudiantes = {};
    if (esAdmin) {
      if (queryInstitucionId) whereEstudiantes.institucion_id = queryInstitucionId;
    } else {
      // docente
      const inst = req.usuario?.institucion_id;
      if (inst == null) {
        return res.status(200).json({ success: true, data: { estudiantes: [] } });
      }
      whereEstudiantes.institucion_id = inst;
    }

    const estudiantes = await Estudiantes.findAll({
      where: whereEstudiantes,
      attributes: ['id', 'nombre', 'apellido', 'edad', 'institucion_id'],
      include: [{ model: Institucion, as: 'institucion', attributes: ['nombre'] }],
      order: [['apellido', 'ASC'], ['nombre', 'ASC']]
    });

    const ids = estudiantes.map((e) => e.id);
    if (ids.length === 0) {
      return res.status(200).json({ success: true, data: { estudiantes: [] } });
    }

    const progresos = await ProgresoActividades.findAll({
      where: { estudiante_id: ids },
      include: [{ model: Actividades, as: 'actividad', attributes: ['id', 'nombre', 'tipo_actividad_id', 'grupo_edad_id', 'nivel'] }]
    });

    const porEstudiante = new Map();
    progresos.forEach((p) => {
      const sid = p.estudiante_id;
      if (!porEstudiante.has(sid)) porEstudiante.set(sid, []);
      porEstudiante.get(sid).push(p);
    });

    const resultado = estudiantes.map((est) => {
      const list = porEstudiante.get(est.id) || [];
      const completadas = list.filter((p) => p.completado);
      const lecturasCompletadas = completadas.filter((p) => p.actividad?.tipo_actividad_id === 1).length;
      const juegosCompletados = completadas.filter((p) => p.actividad?.tipo_actividad_id === 2).length;
      const puntosTotales = list.reduce((sum, p) => sum + (p.puntuacion || 0), 0);
      const ultima = list.reduce((max, p) => {
        const t = p.ultima_interaccion ? new Date(p.ultima_interaccion).getTime() : 0;
        return Math.max(max, t);
      }, 0);

      return {
        estudiante: {
          id: est.id,
          nombre: est.nombre,
          apellido: est.apellido,
          edad: est.edad,
          institucion_id: est.institucion_id,
          institucion: est.institucion?.nombre
        },
        resumen: {
          total_actividades: list.length,
          completadas: completadas.length,
          lecturas_completadas: lecturasCompletadas,
          juegos_completados: juegosCompletados,
          puntos_totales: puntosTotales,
          ultima_interaccion: ultima ? new Date(ultima).toISOString() : null
        }
      };
    });

    return res.status(200).json({
      success: true,
      data: { estudiantes: resultado },
      message: 'Reporte generado exitosamente'
    });
  } catch (error) {
    console.error('Error en reporteEstudiantes:', error);
    return res.status(500).json({ success: false, message: error.message });
  }
};

// GET /reportes/estudiantes/:estudiante_id/detalle
exports.reporteDetalleEstudiante = async (req, res) => {
  try {
    const { estudiante_id } = req.params;
    const out = await buildReporteDetalleData(estudiante_id, req.query);
    if (out.notFound) {
      return res.status(404).json({ success: false, message: 'Estudiante no encontrado' });
    }
    return res.status(200).json(out);
  } catch (error) {
    console.error('Error en reporteDetalleEstudiante:', error);
    return res.status(500).json({ success: false, message: error.message });
  }
};

// GET /reportes/mi-detalle — token de estudiante (JWT sin campo `role`)
exports.reporteMiDetalleEstudiante = async (req, res) => {
  try {
    const estudiante_id = req.usuario.id;
    const out = await buildReporteDetalleData(estudiante_id, req.query);
    if (out.notFound) {
      return res.status(404).json({ success: false, message: 'Estudiante no encontrado' });
    }
    return res.status(200).json(out);
  } catch (error) {
    console.error('Error en reporteMiDetalleEstudiante:', error);
    return res.status(500).json({ success: false, message: error.message });
  }
};
