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
    estudiante_id: {
      type: DataTypes.BIGINT,
      allowNull: false,
      defaultValue: null,
      comment: null,
      primaryKey: false,
      field: "estudiante_id",
      autoIncrement: false,
      unique: "logros_estudiante_estudiante_id_key",
      references: {
        key: "id",
        model: "estudiantes_model"
      }
    },
    puntos_totales: {
      type: DataTypes.INTEGER,
      allowNull: true,
      defaultValue: "0",
      comment: null,
      primaryKey: false,
      field: "puntos_totales",
      autoIncrement: false
    },
    insignias_totales: {
      type: DataTypes.INTEGER,
      allowNull: true,
      defaultValue: "0",
      comment: null,
      primaryKey: false,
      field: "insignias_totales",
      autoIncrement: false
    },
    actividades_completadas: {
      type: DataTypes.INTEGER,
      allowNull: true,
      defaultValue: "0",
      comment: null,
      primaryKey: false,
      field: "actividades_completadas",
      autoIncrement: false
    },
    actividades_perfectas: {
      type: DataTypes.INTEGER,
      allowNull: true,
      defaultValue: "0",
      comment: null,
      primaryKey: false,
      field: "actividades_perfectas",
      autoIncrement: false
    },
    tiempo_total_juegos: {
      type: DataTypes.INTEGER,
      allowNull: true,
      defaultValue: "0",
      comment: null,
      primaryKey: false,
      field: "tiempo_total_juegos",
      autoIncrement: false
    },
    evaluaciones_completadas: {
      type: DataTypes.INTEGER,
      allowNull: true,
      defaultValue: "0",
      comment: null,
      primaryKey: false,
      field: "evaluaciones_completadas",
      autoIncrement: false
    },
    promedio_evaluaciones: {
      type: DataTypes.DOUBLE,
      allowNull: true,
      defaultValue: "0.00",
      comment: null,
      primaryKey: false,
      field: "promedio_evaluaciones",
      autoIncrement: false
    },
    lecturas_completadas: {
      type: DataTypes.INTEGER,
      allowNull: true,
      defaultValue: "0",
      comment: null,
      primaryKey: false,
      field: "lecturas_completadas",
      autoIncrement: false
    },
    tiempo_total_lectura: {
      type: DataTypes.INTEGER,
      allowNull: true,
      defaultValue: "0",
      comment: null,
      primaryKey: false,
      field: "tiempo_total_lectura",
      autoIncrement: false
    },
    palabras_totales_leidas: {
      type: DataTypes.INTEGER,
      allowNull: true,
      defaultValue: "0",
      comment: null,
      primaryKey: false,
      field: "palabras_totales_leidas",
      autoIncrement: false
    },
    racha_dias_actual: {
      type: DataTypes.INTEGER,
      allowNull: true,
      defaultValue: "0",
      comment: null,
      primaryKey: false,
      field: "racha_dias_actual",
      autoIncrement: false
    },
    racha_dias_maxima: {
      type: DataTypes.INTEGER,
      allowNull: true,
      defaultValue: "0",
      comment: null,
      primaryKey: false,
      field: "racha_dias_maxima",
      autoIncrement: false
    },
    ultimo_acceso: {
      type: DataTypes.DATEONLY,
      allowNull: true,
      defaultValue: null,
      comment: null,
      primaryKey: false,
      field: "ultimo_acceso",
      autoIncrement: false
    },
    nivel_actual: {
      type: DataTypes.INTEGER,
      allowNull: true,
      defaultValue: "1",
      comment: null,
      primaryKey: false,
      field: "nivel_actual",
      autoIncrement: false
    },
    experiencia_actual: {
      type: DataTypes.INTEGER,
      allowNull: true,
      defaultValue: "0",
      comment: null,
      primaryKey: false,
      field: "experiencia_actual",
      autoIncrement: false
    },
    experiencia_siguiente_nivel: {
      type: DataTypes.INTEGER,
      allowNull: true,
      defaultValue: "100",
      comment: null,
      primaryKey: false,
      field: "experiencia_siguiente_nivel",
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
    tableName: "logros_estudiante",
    comment: "",
    indexes: [{
      name: "idx_logros_estudiante",
      unique: false,
      fields: ["estudiante_id"]
    }],
    timestamps: false,
    underscored: true,
    freezeTableName: true,
    schema: 'public'
  };
  const LogrosEstudianteModel = sequelize.define("logros_estudiante_model", attributes, options);
  LogrosEstudianteModel.associate = (models) => {
    LogrosEstudianteModel.belongsTo(models.estudiantes_model, { foreignKey: 'estudiante_id', as: 'estudiante' });
  };
  return LogrosEstudianteModel;
};