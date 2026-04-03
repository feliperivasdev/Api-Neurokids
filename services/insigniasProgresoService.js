/**
 * Evalúa y otorga insignias según la tabla `criterios_insignias` cuando el estudiante
 * completa actividades (progreso_actividades).
 *
 * Tipos soportados en `tipo_criterio` (minúsculas, se normalizan):
 * - completar_actividad | actividad_completada
 *   Requiere `condicion_adicional` JSON: { "actividad_id": <id> } (la actividad recién completada debe coincidir).
 * - primera_actividad_completada | primera_actividad
 *   Se otorga cuando el total de actividades completadas del estudiante es exactamente 1 (esta sesión).
 * - primer_juego | primera_actividad_tipo_juego
 *   Primera actividad de tipo juego (tipo_actividad_id = 2) completada.
 * - primera_lectura | primer_lectura | primera_actividad_tipo_lectura
 *   Primera actividad de tipo lectura (tipo_actividad_id = 1) completada.
 * - completar_actividades | cantidad_actividades
 *   Cuenta actividades completadas; opcionalmente filtra por `tipo_actividad_id` y/o `grupo_edad_id` del criterio.
 *   `valor_requerido` = cantidad necesaria. Si aún no alcanza, actualiza progreso_actual / progreso_requerido en insignias_estudiante.
 *
 * Si `condicion_adicional` solo trae `actividad_id` y el tipo es desconocido, se trata como completar_actividad.
 *
 * Registra notificación (notificaciones_estudiante) y actualiza logros_estudiante al desbloquear.
 */

const { Op } = require('sequelize');
const db = require('../models');

const ProgresoActividades = db.progreso_actividades_model;
const Actividades = db.actividades_model;
const CriteriosInsignias = db.criterios_insignias_model;
const InsigniasEstudiante = db.insignias_estudiante_model;
const Insignias = db.insignias_model;
const NotificacionesEstudiante = db.notificaciones_estudiante_model;
const LogrosEstudiante = db.logros_estudiante_model;

function parseCondicion(cond) {
  if (!cond) return {};
  if (typeof cond === 'string') {
    try {
      return JSON.parse(cond);
    } catch {
      return {};
    }
  }
  return cond;
}

/** Evita fallos si Sequelize devuelve BigInt o getters raros en id/tipo. */
function normalizeActividad(actividad) {
  if (!actividad) return null;
  const plain =
    typeof actividad.get === 'function'
      ? actividad.get({ plain: true })
      : { ...actividad };
  return {
    id: Number(plain.id),
    tipo_actividad_id: Number(plain.tipo_actividad_id),
    grupo_edad_id:
      plain.grupo_edad_id != null && plain.grupo_edad_id !== ''
        ? Number(plain.grupo_edad_id)
        : null
  };
}

/**
 * Criterios que significan "completar esta(s) actividad(es) concreta(s)".
 * Varios de estos para la misma insignia se evalúan en OR (completar A o B desbloquea).
 */
function isCriterioCompletarActividadConcreta(criterio) {
  const tipo = String(criterio.tipo_criterio || '')
    .toLowerCase()
    .trim();
  if (
    tipo === 'completar_actividades' ||
    tipo === 'cantidad_actividades' ||
    tipo === 'actividades_completadas' ||
    tipo === 'lecturas_completadas' ||
    tipo === 'sin_errores' ||
    tipo === 'racha_dias' ||
    tipo === 'evaluacion_perfecta' ||
    tipo === 'registro_nuevo' ||
    tipo === 'primera_actividad_completada' ||
    tipo === 'primera_actividad' ||
    tipo === 'primer_juego' ||
    tipo === 'primera_actividad_tipo_juego' ||
    tipo === 'primera_lectura' ||
    tipo === 'primer_lectura' ||
    tipo === 'primera_actividad_tipo_lectura'
  ) {
    return false;
  }
  if (tipo === 'completar_actividad' || tipo === 'actividad_completada') return true;
  const cond = parseCondicion(criterio.condicion_adicional);
  return cond.actividad_id != null;
}

/**
 * Cuenta filas en progreso_actividades con completado=true, con filtros opcionales sobre la actividad relacionada.
 */
async function contarActividadesCompletadas(estudianteIdNum, filters = {}) {
  const { tipo_actividad_id, grupo_edad_id } = filters;
  const includeWhere = {};
  if (tipo_actividad_id != null) includeWhere.tipo_actividad_id = tipo_actividad_id;
  if (grupo_edad_id != null) includeWhere.grupo_edad_id = grupo_edad_id;

  const hasIncludeFilter = Object.keys(includeWhere).length > 0;

  return ProgresoActividades.count({
    where: {
      estudiante_id: estudianteIdNum,
      completado: true
    },
    include: hasIncludeFilter
      ? [
          {
            model: Actividades,
            as: 'actividad',
            attributes: [],
            where: includeWhere,
            required: true
          }
        ]
      : []
  });
}

/** Actividades completadas con 0 respuestas incorrectas (o null). */
async function contarActividadesCompletadasSinErrores(estudianteIdNum, filters = {}) {
  const { tipo_actividad_id, grupo_edad_id } = filters;
  const includeWhere = {};
  if (tipo_actividad_id != null) includeWhere.tipo_actividad_id = tipo_actividad_id;
  if (grupo_edad_id != null) includeWhere.grupo_edad_id = grupo_edad_id;

  const hasIncludeFilter = Object.keys(includeWhere).length > 0;

  return ProgresoActividades.count({
    where: {
      estudiante_id: estudianteIdNum,
      completado: true,
      [Op.or]: [{ respuestas_incorrectas: 0 }, { respuestas_incorrectas: null }]
    },
    include: hasIncludeFilter
      ? [
          {
            model: Actividades,
            as: 'actividad',
            attributes: [],
            where: includeWhere,
            required: true
          }
        ]
      : []
  });
}

/**
 * Evalúa un criterio contra el contexto actual (sin await salvo completar_actividades).
 */
async function evaluarCriterio(criterio, ctx) {
  const tipo = String(criterio.tipo_criterio || '')
    .toLowerCase()
    .trim();
  const cond = parseCondicion(criterio.condicion_adicional);
  const req = Number(criterio.valor_requerido);
  const valorReq = Number.isFinite(req) && req > 0 ? req : 1;

  const tipoActCriterio =
    criterio.tipo_actividad_id != null ? Number(criterio.tipo_actividad_id) : null;
  const grupoEdadCriterio =
    criterio.grupo_edad_id != null ? Number(criterio.grupo_edad_id) : null;

  const actId = Number(ctx.actividad.id);
  const actTipo = Number(ctx.actividad.tipo_actividad_id);
  const actGrupo =
    ctx.actividad.grupo_edad_id != null && ctx.actividad.grupo_edad_id !== ''
      ? Number(ctx.actividad.grupo_edad_id)
      : null;

  switch (tipo) {
    case 'completar_actividad':
    case 'actividad_completada': {
      const target = cond.actividad_id != null ? Number(cond.actividad_id) : null;
      if (target == null || !Number.isFinite(target)) return { ok: false };
      return { ok: ctx.completado && actId === target };
    }
    case 'primera_actividad_completada':
    case 'primera_actividad':
      return {
        ok: ctx.completado && ctx.totalCompletadasGlobal === 1
      };
    case 'primer_juego':
    case 'primera_actividad_tipo_juego':
      return {
        ok: ctx.completado && actTipo === 2 && ctx.totalCompletadasJuegos === 1
      };
    case 'primera_lectura':
    case 'primer_lectura':
    case 'primera_actividad_tipo_lectura':
      return {
        ok: ctx.completado && actTipo === 1 && ctx.totalCompletadasLecturas === 1
      };
    case 'completar_actividades':
    case 'cantidad_actividades':
    /** Alias usado en muchas bases existentes */
    case 'actividades_completadas': {
      const n = await contarActividadesCompletadas(ctx.estudianteId, {
        tipo_actividad_id: tipoActCriterio != null ? tipoActCriterio : undefined,
        grupo_edad_id: grupoEdadCriterio != null ? grupoEdadCriterio : undefined
      });
      return {
        ok: n >= valorReq,
        progresoParcial: { actual: n, requerido: valorReq }
      };
    }
    /** Cuenta solo lecturas (tipo_actividad_id = 1); la fila del criterio puede afinar grupo_edad_id. */
    case 'lecturas_completadas': {
      const n = await contarActividadesCompletadas(ctx.estudianteId, {
        tipo_actividad_id: tipoActCriterio != null ? tipoActCriterio : 1,
        grupo_edad_id: grupoEdadCriterio != null ? grupoEdadCriterio : undefined
      });
      return {
        ok: n >= valorReq,
        progresoParcial: { actual: n, requerido: valorReq }
      };
    }
    /** Actividades completadas sin respuestas incorrectas. */
    case 'sin_errores': {
      const n = await contarActividadesCompletadasSinErrores(ctx.estudianteId, {
        tipo_actividad_id: tipoActCriterio != null ? tipoActCriterio : undefined,
        grupo_edad_id: grupoEdadCriterio != null ? grupoEdadCriterio : undefined
      });
      return {
        ok: n >= valorReq,
        progresoParcial: { actual: n, requerido: valorReq }
      };
    }
    /** Racha en días (logros_estudiante.racha_dias_actual). */
    case 'racha_dias': {
      const r = Number(ctx.rachaDiasActual) || 0;
      return {
        ok: r >= valorReq,
        progresoParcial: { actual: r, requerido: valorReq }
      };
    }
    /** Pendiente de integrar con flujo de evaluaciones; no se desbloquea por progreso de actividades. */
    case 'evaluacion_perfecta':
      return { ok: false };
    /** Solo aplica al alta (auth); insignia 14 se ignora en evaluarInsigniasTrasActividad. */
    case 'registro_nuevo':
      return { ok: false };
    default: {
      if (cond.actividad_id != null) {
        const target = Number(cond.actividad_id);
        return { ok: ctx.completado && actId === target };
      }
      return { ok: false };
    }
  }
}

async function aplicarInsigniaDesbloqueada(estudianteIdNum, insigniaId, actividadOrigenId) {
  const insignia = await Insignias.findByPk(insigniaId);
  if (!insignia || insignia.estado === false) {
    return null;
  }

  const puntos = Number(insignia.puntos_otorgados) || 0;
  const ahora = new Date();

  let reg = await InsigniasEstudiante.findOne({
    where: {
      estudiante_id: estudianteIdNum,
      insignia_id: insigniaId
    }
  });

  if (reg && reg.completado) {
    return null;
  }

  if (!reg) {
    reg = await InsigniasEstudiante.create({
      estudiante_id: estudianteIdNum,
      insignia_id: insigniaId,
      progreso_actual: 1,
      progreso_requerido: 1,
      completado: true,
      notificado: false,
      obtenido_at: ahora,
      actividad_origen_id: actividadOrigenId || null,
      created_at: ahora,
      updated_at: ahora
    });
  } else {
    await reg.update({
      progreso_actual: Math.max(Number(reg.progreso_actual) || 0, 1),
      progreso_requerido: Number(reg.progreso_requerido) || 1,
      completado: true,
      notificado: false,
      obtenido_at: ahora,
      actividad_origen_id: actividadOrigenId || reg.actividad_origen_id,
      updated_at: ahora
    });
  }

  await NotificacionesEstudiante.create({
    estudiante_id: estudianteIdNum,
    tipo_notificacion: 'insignia',
    titulo: `¡Nueva insignia: ${insignia.nombre}!`,
    mensaje: insignia.descripcion || 'Has desbloqueado una insignia.',
    icono: 'trophy',
    leida: false,
    insignia_relacionada_id: insigniaId,
    prioridad: 'alta',
    created_at: ahora
  });

  let logros = await LogrosEstudiante.findOne({
    where: { estudiante_id: estudianteIdNum }
  });
  if (!logros) {
    logros = await LogrosEstudiante.create({
      estudiante_id: estudianteIdNum,
      insignias_totales: 0,
      puntos_totales: 0,
      created_at: ahora,
      updated_at: ahora
    });
  }
  await logros.update({
    insignias_totales: (Number(logros.insignias_totales) || 0) + 1,
    puntos_totales: (Number(logros.puntos_totales) || 0) + puntos,
    updated_at: ahora
  });

  return {
    insignia_id: insigniaId,
    nombre: insignia.nombre,
    descripcion: insignia.descripcion,
    puntos_otorgados: puntos
  };
}

async function actualizarProgresoParcial(estudianteIdNum, insigniaId, actual, requerido) {
  const ahora = new Date();
  let reg = await InsigniasEstudiante.findOne({
    where: { estudiante_id: estudianteIdNum, insignia_id: insigniaId }
  });

  if (reg && reg.completado) return;

  if (!reg) {
    await InsigniasEstudiante.create({
      estudiante_id: estudianteIdNum,
      insignia_id: insigniaId,
      progreso_actual: actual,
      progreso_requerido: requerido,
      completado: false,
      notificado: false,
      created_at: ahora,
      updated_at: ahora
    });
  } else {
    await reg.update({
      progreso_actual: actual,
      progreso_requerido: requerido,
      completado: false,
      updated_at: ahora
    });
  }
}

/**
 * @param {number} estudianteIdNum
 * @param {import('sequelize').Model} actividad - modelo Actividades
 * @param {boolean} completado - si en esta petición la actividad quedó completada
 * @returns {Promise<Array<{ insignia_id: number, nombre: string, descripcion: string, puntos_otorgados: number }>>}
 */
async function evaluarInsigniasTrasActividad(estudianteIdNum, actividad, completado) {
  if (!actividad) {
    return [];
  }

  const actPlain = normalizeActividad(actividad);
  if (!actPlain || !Number.isFinite(actPlain.id)) {
    return desbloqueadas;
  }

  const ctx = await construirContextoInsignias(estudianteIdNum, actPlain, completado);
  const origenId =
    actPlain.id && Number(actPlain.id) > 0 ? Number(actPlain.id) : null;
  return ejecutarEvaluacionInsignias(estudianteIdNum, ctx, origenId);
}

/**
 * Tras login/visita: evalúa criterios que no dependen de una actividad concreta en esta petición
 * (p. ej. racha de días, cantidad total). actividad origen en insignias_estudiante queda null.
 */
async function evaluarInsigniasRachaTrasAcceso(estudianteIdNum) {
  const dummy = { id: 0, tipo_actividad_id: 1, grupo_edad_id: null };
  const ctx = await construirContextoInsignias(estudianteIdNum, dummy, false);
  return ejecutarEvaluacionInsignias(estudianteIdNum, ctx, null);
}

async function construirContextoInsignias(estudianteIdNum, actPlain, completado) {
  const totalCompletadasGlobal = await ProgresoActividades.count({
    where: { estudiante_id: estudianteIdNum, completado: true }
  });

  const totalCompletadasJuegos = await contarActividadesCompletadas(estudianteIdNum, {
    tipo_actividad_id: 2
  });
  const totalCompletadasLecturas = await contarActividadesCompletadas(estudianteIdNum, {
    tipo_actividad_id: 1
  });

  const logrosStreak = await LogrosEstudiante.findOne({
    where: { estudiante_id: estudianteIdNum },
    attributes: ['racha_dias_actual']
  });
  /** Racha actual (días seguidos con acceso); no mezclar con máxima histórica para el umbral de insignia. */
  const rachaDiasActual = logrosStreak ? Number(logrosStreak.racha_dias_actual) || 0 : 0;

  return {
    estudianteId: estudianteIdNum,
    actividad: actPlain,
    completado: Boolean(completado),
    totalCompletadasGlobal,
    totalCompletadasJuegos,
    totalCompletadasLecturas,
    rachaDiasActual
  };
}

async function ejecutarEvaluacionInsignias(estudianteIdNum, ctx, actividadOrigenId) {
  const desbloqueadas = [];

  const todosCriterios = await CriteriosInsignias.findAll({ raw: true });
  if (!todosCriterios.length) {
    return desbloqueadas;
  }

  const porInsignia = new Map();
  for (const c of todosCriterios) {
    const iid = Number(c.insignia_id);
    if (!porInsignia.has(iid)) porInsignia.set(iid, []);
    porInsignia.get(iid).push(c);
  }

  for (const [insigniaId, criterios] of porInsignia.entries()) {
    if (insigniaId === 14) {
      // Insignia de bienvenida: solo registro
      continue;
    }

    const ya = await InsigniasEstudiante.findOne({
      where: { estudiante_id: estudianteIdNum, insignia_id: insigniaId }
    });
    if (ya && ya.completado) continue;

    const porActividadConcreta = criterios.filter(isCriterioCompletarActividadConcreta);
    const otrosCriterios = criterios.filter((c) => !isCriterioCompletarActividadConcreta(c));

    let orPart = true;
    if (porActividadConcreta.length > 0) {
      orPart = false;
      for (const c of porActividadConcreta) {
        const res = await evaluarCriterio(c, ctx);
        if (res.ok) {
          orPart = true;
          break;
        }
      }
    }

    let restoOk = true;
    let parcialMejor = null;
    for (const c of otrosCriterios) {
      const res = await evaluarCriterio(c, ctx);
      if (!res.ok) {
        restoOk = false;
        if (res.progresoParcial) {
          parcialMejor = res.progresoParcial;
        }
      }
    }

    const allOk = orPart && restoOk;

    if (allOk) {
      const out = await aplicarInsigniaDesbloqueada(
        estudianteIdNum,
        insigniaId,
        actividadOrigenId
      );
      if (out) desbloqueadas.push(out);
    } else if (
      parcialMejor &&
      parcialMejor.actual < parcialMejor.requerido
    ) {
      await actualizarProgresoParcial(
        estudianteIdNum,
        insigniaId,
        parcialMejor.actual,
        parcialMejor.requerido
      );
    }
  }

  return desbloqueadas;
}

module.exports = {
  evaluarInsigniasTrasActividad,
  evaluarInsigniasRachaTrasAcceso,
  contarActividadesCompletadas
};
