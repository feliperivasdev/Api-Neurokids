const {
  DataTypes
} = require('sequelize');
module.exports = sequelize => {
  const attributes = {
    id: {
      type: DataTypes.INTEGER,
      allowNull: false,
      defaultValue: null,
      comment: null,
      primaryKey: true,
      field: "id",
      autoIncrement: true
    },
    evaluacion_usuario_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
      defaultValue: null,
      comment: null,
      primaryKey: false,
      field: "evaluacion_usuario_id",
      autoIncrement: false,
      references: {
        key: "id",
        model: "evaluaciones_usuarios_model"
      }
    },
    pregunta_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
      defaultValue: null,
      comment: null,
      primaryKey: false,
      field: "pregunta_id",
      autoIncrement: false,
      references: {
        key: "id",
        model: "preguntas_evaluacion_model"
      }
    },
    respuesta_id: {
      type: DataTypes.INTEGER,
      allowNull: true,
      defaultValue: null,
      comment: null,
      primaryKey: false,
      field: "respuesta_id",
      autoIncrement: false,
      references: {
        key: "id",
        model: "respuestas_evaluacion_model"
      }
    },
    correcta: {
      type: DataTypes.BOOLEAN,
      allowNull: true,
      defaultValue: null,
      comment: null,
      primaryKey: false,
      field: "correcta",
      autoIncrement: false
    },
    tiempo_respuesta: {
      type: DataTypes.INTEGER,
      allowNull: true,
      defaultValue: null,
      comment: null,
      primaryKey: false,
      field: "tiempo_respuesta",
      autoIncrement: false
    },
    created_at: {
      type: DataTypes.DATE,
      allowNull: false,
      defaultValue: sequelize.fn('now'),
      comment: null,
      primaryKey: false,
      field: "created_at",
      autoIncrement: false
    }
  };
  const options = {
    tableName: "resultados_preguntas",
    comment: "",
    indexes: [{
      name: "idx_resultados_preguntas_evaluser",
      unique: false,
      fields: ["evaluacion_usuario_id"]
    }]
  };
  const ResultadosPreguntasModel = sequelize.define("resultados_preguntas_model", attributes, options);

  // Associations
  ResultadosPreguntasModel.associate = models => {
    ResultadosPreguntasModel.belongsTo(models.evaluaciones_usuarios_model, { foreignKey: "evaluacion_usuario_id", as: "evaluacion_usuario" });
    ResultadosPreguntasModel.belongsTo(models.preguntas_evaluacion_model, { foreignKey: "pregunta_id", as: "pregunta" });
  };
  return ResultadosPreguntasModel;
};