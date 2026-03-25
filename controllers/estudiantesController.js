const db = require('../models');
const Estudiantes = db.estudiantes_model;
const LogrosEstudiante = db.logros_estudiante_model;
const Institucion = db.instituciones_model;
const Rol = db.roles_model;

exports.getPerfilCompleto = async (req, res) => {
    try {
        const { id } = req.params;
        const estudiante = await Estudiantes.findByPk(id, {
            include: [{
                model: LogrosEstudiante,
                as: 'logros'
            }]
        });
        
        if (!estudiante) return res.status(404).json({ message: "No encontrado" });
        
        res.status(200).json({ success: true, data: estudiante });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

// Listar estudiantes con paginación y filtros básicos
// Si el usuario es docente, solo ve estudiantes de su institución; administradores ven todos
exports.listarEstudiantes = async (req, res) => {
    try {
        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 20;
        const offset = (page - 1) * limit;

        const { institucion_id: queryInstitucionId, edad, search } = req.query;

        const whereClause = {};

        // Docente: restringir siempre a su institución; Admin: puede filtrar por query o ver todos
        const esAdministrador = req.usuario.rol_id === 1 || req.usuario.rol_nombre === 'administrador';
        if (esAdministrador) {
            if (queryInstitucionId) {
                whereClause.institucion_id = queryInstitucionId;
            }
        } else {
            // Docente: solo estudiantes de su institución
            const institucionDocente = req.usuario.institucion_id;
            if (institucionDocente != null && institucionDocente !== undefined) {
                whereClause.institucion_id = institucionDocente;
            } else {
                // Docente sin institución asignada: devolver lista vacía
                return res.status(200).json({
                    success: true,
                    data: {
                        estudiantes: [],
                        pagination: { current_page: 1, per_page: limit, total: 0, total_pages: 0 }
                    },
                    message: 'Estudiantes obtenidos exitosamente'
                });
            }
        }

        if (edad) {
            whereClause.edad = edad;
        }

        if (search && typeof search === 'string' && search.trim()) {
            whereClause.nombre = db.Sequelize.where(
                db.Sequelize.fn('LOWER', db.Sequelize.col('nombre')),
                'LIKE',
                `%${search.trim().toLowerCase()}%`
            );
        }

        const { count, rows: estudiantes } = await Estudiantes.findAndCountAll({
            where: whereClause,
            include: [
                {
                    model: Institucion,
                    as: 'institucion',
                    attributes: ['nombre']
                },
                {
                    model: Rol,
                    as: 'rol',
                    attributes: ['nombre', 'descripcion']
                }
            ],
            attributes: ['id', 'nombre', 'apellido', 'correo', 'edad', 'institucion_id', 'rol_id', 'estado', 'created_at'],
            limit,
            offset,
            order: [['created_at', 'DESC']]
        });

        return res.status(200).json({
            success: true,
            data: {
                estudiantes,
                pagination: {
                    current_page: page,
                    per_page: limit,
                    total: count,
                    total_pages: Math.ceil(count / limit)
                }
            },
            message: 'Estudiantes obtenidos exitosamente'
        });
    } catch (error) {
        console.error('Error en listarEstudiantes:', error);
        return res.status(500).json({
            success: false,
            message: error.message
        });
    }
};