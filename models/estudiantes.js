const {
  DataTypes
} = require('sequelize');
module.exports = sequelize => {
  const attributes = {
    id: {
      type: DataTypes.BIGINT,
      allowNull: false,
      defaultValue: null,
      comment: null,
      primaryKey: true,
      field: "id",
      autoIncrement: true
    },
    nombre: {
      type: DataTypes.CHAR(255),
      allowNull: false,
      defaultValue: null,
      comment: null,
      primaryKey: false,
      field: "nombre",
      autoIncrement: false
    },
    apellido: {
      type: DataTypes.CHAR(255),
      allowNull: false,
      defaultValue: null,
      comment: null,
      primaryKey: false,
      field: "apellido",
      autoIncrement: false
    },
    codigo_estudiante: {
      type: DataTypes.CHAR(100),
      allowNull: true,
      defaultValue: null,
      comment: null,
      primaryKey: false,
      field: "codigo_estudiante",
      autoIncrement: false,
      unique: "estudiantes_codigo_estudiante_key"
    },
    edad: {
      type: DataTypes.INTEGER,
      allowNull: true,
      defaultValue: null,
      comment: null,
      primaryKey: false,
      field: "edad",
      autoIncrement: false
    },
    num_documento: {
      type: DataTypes.CHAR(50),
      allowNull: true,
      defaultValue: null,
      comment: null,
      primaryKey: false,
      field: "num_documento",
      autoIncrement: false
    },
    correo: {
      type: DataTypes.CHAR(255),
      allowNull: true,
      defaultValue: null,
      comment: null,
      primaryKey: false,
      field: "correo",
      autoIncrement: false
    },
    institucion_id: {
      type: DataTypes.BIGINT,
      allowNull: false,
      defaultValue: null,
      comment: null,
      primaryKey: false,
      field: "institucion_id",
      autoIncrement: false,
      references: {
        key: "id",
        model: "instituciones_model"
      }
    },
    estado: {
      type: DataTypes.BOOLEAN,
      allowNull: true,
      defaultValue: null,
      comment: null,
      primaryKey: false,
      field: "estado",
      autoIncrement: false
    },
    created_at: {
      type: DataTypes.DATE,
      allowNull: true,
      defaultValue: sequelize.fn('now'),
      comment: null,
      primaryKey: false,
      field: "created_at",
      autoIncrement: false
    },
    updated_at: {
      type: DataTypes.DATE,
      allowNull: true,
      defaultValue: sequelize.fn('now'),
      comment: null,
      primaryKey: false,
      field: "updated_at",
      autoIncrement: false
    },
    rol_id: {
      type: DataTypes.BIGINT,
      allowNull: false,
      defaultValue: "3",
      comment: null,
      primaryKey: false,
      field: "rol_id",
      autoIncrement: false,
      references: {
        key: "id",
        model: "roles_model"
      }
    }
  };
  const options = {
    tableName: "estudiantes",
    comment: "",
    indexes: [{
      name: "idx_estudiantes_codigo",
      unique: false,
      fields: ["codigo_estudiante"]
    }, {
      name: "idx_estudiantes_edad",
      unique: false,
      fields: ["edad"]
    }, {
      name: "idx_estudiantes_institucion",
      unique: false,
      fields: ["institucion_id"]
    }],
    timestamps: false,
    underscored: true,
    freezeTableName: true,
    schema: 'public'
  };
  const EstudiantesModel = sequelize.define("estudiantes_model", attributes, options);
  EstudiantesModel.associate = (models) => {
    EstudiantesModel.belongsTo(models.instituciones_model, { foreignKey: 'institucion_id', as: 'institucion' });
    EstudiantesModel.belongsTo(models.roles_model, { foreignKey: 'rol_id', as: 'rol' });
    EstudiantesModel.hasMany(models.tokens_acceso_model, { foreignKey: 'estudiante_id', as: 'tokens' });
    EstudiantesModel.hasMany(models.sesiones_model, { foreignKey: 'estudiante_id', as: 'sesiones' });
    EstudiantesModel.hasMany(models.progreso_actividades_model, { foreignKey: 'estudiante_id', as: 'progresoActividades' });
    EstudiantesModel.hasMany(models.progreso_lecturas_model, { foreignKey: 'estudiante_id', as: 'progresoLecturas' });
    EstudiantesModel.hasMany(models.resultados_evaluacion_model, { foreignKey: 'estudiante_id', as: 'resultados' });
    EstudiantesModel.hasMany(models.logros_estudiante_model, { foreignKey: 'estudiante_id', as: 'logros' });
    EstudiantesModel.hasMany(models.insignias_estudiante_model, { foreignKey: 'estudiante_id', as: 'insignias' });
    EstudiantesModel.hasMany(models.notificaciones_estudiante_model, { foreignKey: 'estudiante_id', as: 'notificaciones' });
    EstudiantesModel.hasMany(models.accesos_plataforma_estudiante_model, { foreignKey: 'estudiante_id', as: 'accesosPlataforma' });
    EstudiantesModel.hasMany(models.lecturas_generadas_model, { foreignKey: 'estudiante_id', as: 'lecturas' });
    EstudiantesModel.hasMany(models.feedback_lecturas_ia_model, { foreignKey: 'estudiante_id', as: 'feedbacksRecibidos' });
    EstudiantesModel.hasMany(models.respuestas_estudiante_model, { foreignKey: 'estudiante_id', as: 'respuestas' });
    EstudiantesModel.hasMany(models.evaluaciones_usuarios_model, { foreignKey: 'estudiante_id', as: 'evaluacionesUsuario' });
    EstudiantesModel.hasMany(models.usuarios_insignias_model, { foreignKey: 'estudiante_id', as: 'usuarioInsignias' });
    EstudiantesModel.hasMany(models.usuarios_juegos_model, { foreignKey: 'estudiante_id', as: 'usuarioJuegos' });
    EstudiantesModel.hasMany(models.usuarios_lecturas_model, { foreignKey: 'estudiante_id', as: 'usuarioLecturas' });
  };
  return EstudiantesModel;
};