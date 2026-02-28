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
    evaluacion_id: {
      type: DataTypes.BIGINT,
      allowNull: false,
      defaultValue: null,
      comment: null,
      primaryKey: false,
      field: "evaluacion_id",
      autoIncrement: false,
      references: {
        key: "id",
        model: "evaluaciones_iniciales_model"
      }
    },
    puntuacion_total: {
      type: DataTypes.INTEGER,
      allowNull: false,
      defaultValue: null,
      comment: null,
      primaryKey: false,
      field: "puntuacion_total",
      autoIncrement: false
    },
    puntuacion_maxima: {
      type: DataTypes.INTEGER,
      allowNull: false,
      defaultValue: null,
      comment: null,
      primaryKey: false,
      field: "puntuacion_maxima",
      autoIncrement: false
    },
    porcentaje_aciertos: {
      type: DataTypes.DOUBLE,
      allowNull: true,
      defaultValue: null,
      comment: null,
      primaryKey: false,
      field: "porcentaje_aciertos",
      autoIncrement: false
    },
    tiempo_completado: {
      type: DataTypes.INTEGER,
      allowNull: true,
      defaultValue: null,
      comment: null,
      primaryKey: false,
      field: "tiempo_completado",
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
    nivel_recomendado: {
      type: DataTypes.CHAR(50),
      allowNull: true,
      defaultValue: null,
      comment: null,
      primaryKey: false,
      field: "nivel_recomendado",
      autoIncrement: false
    },
    observaciones: {
      type: DataTypes.TEXT,
      allowNull: true,
      defaultValue: null,
      comment: null,
      primaryKey: false,
      field: "observaciones",
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
    tableName: "resultados_evaluacion",
    comment: "",
    indexes: [{
      name: "idx_resultados_estudiante",
      unique: false,
      fields: ["estudiante_id"]
    }, {
      name: "idx_resultados_evaluacion",
      unique: false,
      fields: ["evaluacion_id"]
    }, {
      name: "resultados_evaluacion_estudiante_id_evaluacion_id_key",
      unique: true,
      fields: ["estudiante_id", "evaluacion_id"]
    }],
    timestamps: false,
    underscored: true,
    freezeTableName: true,
    schema: 'public'
  };
  const ResultadosEvaluacionModel = sequelize.define("resultados_evaluacion_model", attributes, options);
  ResultadosEvaluacionModel.associate = (models) => {
    ResultadosEvaluacionModel.belongsTo(models.estudiantes_model, { foreignKey: 'estudiante_id', as: 'estudiante' });
    ResultadosEvaluacionModel.belongsTo(models.evaluaciones_iniciales_model, { foreignKey: 'evaluacion_id', as: 'evaluacion' });
    ResultadosEvaluacionModel.hasMany(models.respuestas_estudiante_model, { foreignKey: 'resultado_evaluacion_id', as: 'respuestas' });
  };
  return ResultadosEvaluacionModel;
};