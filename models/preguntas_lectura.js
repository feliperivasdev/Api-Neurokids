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
    lectura_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
      defaultValue: null,
      comment: null,
      primaryKey: false,
      field: "lectura_id",
      autoIncrement: false,
      references: {
        key: "id",
        model: "lecturas_model"
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
    orden: {
      type: DataTypes.INTEGER,
      allowNull: false,
      defaultValue: "1",
      comment: null,
      primaryKey: false,
      field: "orden",
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
    }
  };
  const options = {
    tableName: "preguntas_lectura",
    comment: "",
    indexes: [{
      name: "idx_preguntas_lectura_lectura",
      unique: false,
      fields: ["lectura_id"]
    }]
  };
  const PreguntasLecturaModel = sequelize.define("preguntas_lectura_model", attributes, options);
  return PreguntasLecturaModel;
};