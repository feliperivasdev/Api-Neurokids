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
      autoIncrement: false
    },
    estudiante_id: {
      type: DataTypes.BIGINT,
      allowNull: false,
      defaultValue: null,
      comment: null,
      primaryKey: false,
      field: "estudiante_id",
      autoIncrement: false,
      references: {
        key: "id",
        model: "estudiantes_model"
      }
    },
    actividad_id: {
      type: DataTypes.BIGINT,
      allowNull: false,
      defaultValue: null,
      comment: null,
      primaryKey: false,
      field: "actividad_id",
      autoIncrement: false,
      references: {
        key: "id",
        model: "actividades_model"
      }
    },
    puntuacion: {
      type: DataTypes.INTEGER,
      allowNull: true,
      defaultValue: "0",
      comment: null,
      primaryKey: false,
      field: "puntuacion",
      autoIncrement: false
    },
    puntuacion_maxima: {
      type: DataTypes.INTEGER,
      allowNull: true,
      defaultValue: "100",
      comment: null,
      primaryKey: false,
      field: "puntuacion_maxima",
      autoIncrement: false
    },
    completado: {
      type: DataTypes.BOOLEAN,
      allowNull: true,
      defaultValue: null,
      comment: null,
      primaryKey: false,
      field: "completado",
      autoIncrement: false
    },
    completado_at: {
      type: DataTypes.DATE,
      allowNull: true,
      defaultValue: null,
      comment: null,
      primaryKey: false,
      field: "completado_at",
      autoIncrement: false
    },
    intentos: {
      type: DataTypes.INTEGER,
      allowNull: true,
      defaultValue: "0",
      comment: null,
      primaryKey: false,
      field: "intentos",
      autoIncrement: false
    },
    tiempo_total: {
      type: DataTypes.INTEGER,
      allowNull: true,
      defaultValue: "0",
      comment: null,
      primaryKey: false,
      field: "tiempo_total",
      autoIncrement: false
    },
    ultima_interaccion: {
      type: DataTypes.DATE,
      allowNull: true,
      defaultValue: sequelize.fn('now'),
      comment: null,
      primaryKey: false,
      field: "ultima_interaccion",
      autoIncrement: false
    },
    respuestas_correctas: {
      type: DataTypes.INTEGER,
      allowNull: true,
      defaultValue: 0,
      primaryKey: false,
      field: "respuestas_correctas",
      autoIncrement: false
    },
    respuestas_incorrectas: {
      type: DataTypes.INTEGER,
      allowNull: true,
      defaultValue: 0,
      primaryKey: false,
      field: "respuestas_incorrectas",
      autoIncrement: false
    },
    uso_audio: {
      type: DataTypes.INTEGER,
      allowNull: true,
      defaultValue: 0,
      primaryKey: false,
      field: "uso_audio",
      autoIncrement: false
    },
    /** JSON: { levelScores, levelsCompleted, maxLevelReached, lecturaSimple } */
    detalle_niveles: {
      type: DataTypes.JSON,
      allowNull: true,
      defaultValue: null,
      comment: null,
      primaryKey: false,
      field: "detalle_niveles",
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
    }
  };
  const options = {
    tableName: "progreso_actividades",
    comment: "",
    indexes: [{
      name: "idx_progreso_actividad",
      unique: false,
      fields: ["actividad_id"]
    }, {
      name: "idx_progreso_completado",
      unique: false,
      fields: ["completado"]
    }, {
      name: "idx_progreso_estudiante",
      unique: false,
      fields: ["estudiante_id"]
    }, {
      name: "progreso_actividades_estudiante_id_actividad_id_key",
      unique: true,
      fields: ["estudiante_id", "actividad_id"]
    }],
    timestamps: false,
    underscored: true,
    freezeTableName: true,
    schema: 'public'
  };
  const ProgresoActividadesModel = sequelize.define("progreso_actividades_model", attributes, options);
  ProgresoActividadesModel.associate = (models) => {
    ProgresoActividadesModel.belongsTo(models.estudiantes_model, { foreignKey: 'estudiante_id', as: 'estudiante' });
    ProgresoActividadesModel.belongsTo(models.actividades_model, { foreignKey: 'actividad_id', as: 'actividad' });
  };
  return ProgresoActividadesModel;
};