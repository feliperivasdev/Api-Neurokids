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
        model: "preguntas_lectura_model"
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
    tableName: "respuestas_lectura",
    comment: "",
    indexes: [{
      name: "idx_respuestas_lectura_pregunta",
      unique: false,
      fields: ["pregunta_id"]
    }]
  };
  const RespuestasLecturaModel = sequelize.define("respuestas_lectura_model", attributes, options);
  return RespuestasLecturaModel;
};