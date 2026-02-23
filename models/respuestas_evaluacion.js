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
    texto: {
      type: DataTypes.TEXT,
      allowNull: false,
      defaultValue: null,
      comment: null,
      primaryKey: false,
      field: "texto",
      autoIncrement: false
    },
    es_correcta: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: null,
      comment: null,
      primaryKey: false,
      field: "es_correcta",
      autoIncrement: false
    },
    orden: {
      type: DataTypes.INTEGER,
      allowNull: false,
      defaultValue: "1",
      comment: null,
      primaryKey: false,
      field: "orden",
      autoIncrement: false
    }
  };
  const options = {
    tableName: "respuestas_evaluacion",
    comment: "",
    indexes: [{
      name: "idx_respuestas_eval_pregunta",
      unique: false,
      fields: ["pregunta_id"]
    }]
  };
  const RespuestasEvaluacionModel = sequelize.define("respuestas_evaluacion_model", attributes, options);

  // Associations
  RespuestasEvaluacionModel.associate = models => {
    RespuestasEvaluacionModel.belongsTo(models.preguntas_evaluacion_model, { foreignKey: "pregunta_id", as: "pregunta" });
  };
  return RespuestasEvaluacionModel;
};