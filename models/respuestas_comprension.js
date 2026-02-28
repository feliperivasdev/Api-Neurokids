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
    progreso_lectura_id: {
      type: DataTypes.BIGINT,
      allowNull: false,
      defaultValue: null,
      comment: null,
      primaryKey: false,
      field: "progreso_lectura_id",
      autoIncrement: false,
      references: {
        key: "id",
        model: "progreso_lecturas_model"
      }
    },
    pregunta_comprension_id: {
      type: DataTypes.BIGINT,
      allowNull: false,
      defaultValue: null,
      comment: null,
      primaryKey: false,
      field: "pregunta_comprension_id",
      autoIncrement: false,
      references: {
        key: "id",
        model: "preguntas_comprension_lectura_model"
      }
    },
    opcion_seleccionada_id: {
      type: DataTypes.BIGINT,
      allowNull: true,
      defaultValue: null,
      comment: null,
      primaryKey: false,
      field: "opcion_seleccionada_id",
      autoIncrement: false,
      references: {
        key: "id",
        model: "opciones_comprension_lectura_model"
      }
    },
    respuesta_abierta: {
      type: DataTypes.TEXT,
      allowNull: true,
      defaultValue: null,
      comment: null,
      primaryKey: false,
      field: "respuesta_abierta",
      autoIncrement: false
    },
    respuesta_dibujo: {
      type: DataTypes.CHAR(500),
      allowNull: true,
      defaultValue: null,
      comment: null,
      primaryKey: false,
      field: "respuesta_dibujo",
      autoIncrement: false
    },
    es_correcta: {
      type: DataTypes.BOOLEAN,
      allowNull: true,
      defaultValue: null,
      comment: null,
      primaryKey: false,
      field: "es_correcta",
      autoIncrement: false
    },
    puntuacion_obtenida: {
      type: DataTypes.INTEGER,
      allowNull: true,
      defaultValue: "0",
      comment: null,
      primaryKey: false,
      field: "puntuacion_obtenida",
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
    intentos: {
      type: DataTypes.INTEGER,
      allowNull: true,
      defaultValue: "1",
      comment: null,
      primaryKey: false,
      field: "intentos",
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
    tableName: "respuestas_comprension",
    comment: "",
    indexes: []
  };
  const RespuestasComprensionModel = sequelize.define("respuestas_comprension_model", attributes, options);
  return RespuestasComprensionModel;
};