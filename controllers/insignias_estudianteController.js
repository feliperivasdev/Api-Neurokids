const db = require('../models');
const InsigniasEstudiante = db.insignias_estudiante_model;
const Insignias = db.insignias_model;

/** Una insignia cuenta como desbloqueada si el registro indica completado o alcanzó el progreso requerido */
function insigniaDesbloqueada(reg) {
  if (!reg) return false;
  if (reg.completado === true) return true;
  const req = reg.progreso_requerido != null ? Number(reg.progreso_requerido) : 1;
  const act = reg.progreso_actual != null ? Number(reg.progreso_actual) : 0;
  return req > 0 && act >= req;
}

/**
 * GET /insignias-estudiante/estudiante/:estudiante_id/catalogo
 * Todas las insignias de la tabla `insignias` con estado desbloqueada/bloqueada según `insignias_estudiante`.
 */
exports.getCatalogoInsigniasEstudiante = async (req, res) => {
  try {
    const { estudiante_id } = req.params;
    const estudianteIdNum = parseInt(estudiante_id, 10);
    if (!Number.isFinite(estudianteIdNum)) {
      return res.status(400).json({ success: false, message: 'estudiante_id inválido' });
    }

    // Todas las filas de `insignias` (nombres y metadatos vienen de la BD)
    const catalogo = await Insignias.findAll({
      order: [
        ['orden_presentacion', 'ASC'],
        ['id', 'ASC']
      ]
    });

    const registros = await InsigniasEstudiante.findAll({
      where: { estudiante_id: estudianteIdNum },
      attributes: [
        'insignia_id',
        'completado',
        'obtenido_at',
        'progreso_actual',
        'progreso_requerido'
      ]
    });

    const porInsignia = new Map(registros.map((r) => [Number(r.insignia_id), r]));

    const data = catalogo.map((ins) => {
      const g = porInsignia.get(Number(ins.id));
      return {
        id: ins.id,
        nombre: ins.nombre,
        descripcion: ins.descripcion,
        icono: ins.icono,
        color_hex: ins.color_hex,
        categoria: ins.categoria,
        rareza: ins.rareza,
        puntos_otorgados: ins.puntos_otorgados,
        desbloqueada: insigniaDesbloqueada(g),
        obtenido_at: g?.obtenido_at || null,
        progreso_actual: g?.progreso_actual ?? null,
        progreso_requerido: g?.progreso_requerido ?? null
      };
    });

    return res.status(200).json({ success: true, data });
  } catch (error) {
    console.error('getCatalogoInsigniasEstudiante:', error);
    return res.status(500).json({ success: false, message: error.message });
  }
};

exports.getInsigniasPorEstudiante = async (req, res) => {
    try {
        const { estudiante_id } = req.params;
        const estudianteIdNum = parseInt(estudiante_id, 10);
        if (!Number.isFinite(estudianteIdNum)) {
            return res.status(400).json({ success: false, message: 'estudiante_id inválido' });
        }
        const insignias = await InsigniasEstudiante.findAll({
            where: { estudiante_id: estudianteIdNum },
            include: [{
                model: Insignias,
                as: 'insignia' // Verifica que este alias coincida en tu modelo insignias_estudiante.js
            }]
        });
        res.status(200).json({ success: true, data: insignias });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};