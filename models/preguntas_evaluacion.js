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
    evaluacion_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
      defaultValue: null,
      comment: null,
      primaryKey: false,
      field: "evaluacion_id",
      autoIncrement: false,
      references: {
        key: "id",
        model: "evaluaciones_model"
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
    tipo: {
      type: DataTypes.CHAR(50),
      allowNull: false,
      defaultValue: "opcion_multiple",
      comment: null,
      primaryKey: false,
      field: "tipo",
      autoIncrement: false
    },
    nivel_dificultad_id: {
      type: DataTypes.INTEGER,
      allowNull: true,
      defaultValue: null,
      comment: null,
      primaryKey: false,
      field: "nivel_dificultad_id",
      autoIncrement: false,
      references: {
        key: "id",
        model: "niveles_dificultad_model"
      }
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
    tableName: "preguntas_evaluacion",
    comment: "",
    indexes: [{
      name: "idx_preguntas_eval_eval",
      unique: false,
      fields: ["evaluacion_id"]
    }]
  };
  const PreguntasEvaluacionModel = sequelize.define("preguntas_evaluacion_model", attributes, options);
  return PreguntasEvaluacionModel;
};