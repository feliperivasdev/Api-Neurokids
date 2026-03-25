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
  const actGrupo = ctx.actividad.grupo_edad_id != null ? Number(ctx.actividad.grupo_edad_id) : null;

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
    case 'cantidad_actividades': {
      const n = await contarActividadesCompletadas(ctx.estudianteId, {
        tipo_actividad_id: tipoActCriterio != null ? tipoActCriterio : undefined,
        grupo_edad_id: grupoEdadCriterio != null ? grupoEdadCriterio : undefined
      });
      return {
        ok: n >= valorReq,
        progresoParcial: { actual: n, requerido: valorReq }
      };
    }
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

  const logros = await LogrosEstudiante.findOne({
    where: { estudiante_id: estudianteIdNum }
  });
  if (logros) {
    await logros.update({
      insignias_totales: (Number(logros.insignias_totales) || 0) + 1,
      puntos_totales: (Number(logros.puntos_totales) || 0) + puntos,
      updated_at: ahora
    });
  }

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
  const desbloqueadas = [];

  if (!completado || !actividad) {
    return desbloqueadas;
  }

  const totalCompletadasGlobal = await ProgresoActividades.count({
    where: { estudiante_id: estudianteIdNum, completado: true }
  });

  const totalCompletadasJuegos = await contarActividadesCompletadas(estudianteIdNum, {
    tipo_actividad_id: 2
  });
  const totalCompletadasLecturas = await contarActividadesCompletadas(estudianteIdNum, {
    tipo_actividad_id: 1
  });

  const ctx = {
    estudianteId: estudianteIdNum,
    actividad,
    completado: true,
    totalCompletadasGlobal,
    totalCompletadasJuegos,
    totalCompletadasLecturas
  };

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

    let allOk = true;
    let parcialUnico = null;

    for (const c of criterios) {
      const res = await evaluarCriterio(c, ctx);
      if (!res.ok) {
        allOk = false;
        if (criterios.length === 1 && res.progresoParcial) {
          parcialUnico = res.progresoParcial;
        }
      }
    }

    if (allOk) {
      const out = await aplicarInsigniaDesbloqueada(
        estudianteIdNum,
        insigniaId,
        Number(actividad.id)
      );
      if (out) desbloqueadas.push(out);
    } else if (
      parcialUnico &&
      parcialUnico.actual < parcialUnico.requerido
    ) {
      await actualizarProgresoParcial(
        estudianteIdNum,
        insigniaId,
        parcialUnico.actual,
        parcialUnico.requerido
      );
    }
  }

  return desbloqueadas;
}

module.exports = {
  evaluarInsigniasTrasActividad,
  contarActividadesCompletadas
};
