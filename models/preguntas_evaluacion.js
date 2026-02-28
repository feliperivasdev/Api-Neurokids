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
    pregunta: {
      type: DataTypes.TEXT,
      allowNull: false,
      defaultValue: null,
      comment: null,
      primaryKey: false,
      field: "pregunta",
      autoIncrement: false
    },
    tipo_pregunta: {
      type: user - defined,
      allowNull: true,
      defaultValue: "multiple_choice",
      comment: null,
      primaryKey: false,
      field: "tipo_pregunta",
      autoIncrement: false
    },
    puntuacion: {
      type: DataTypes.INTEGER,
      allowNull: true,
      defaultValue: "1",
      comment: null,
      primaryKey: false,
      field: "puntuacion",
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
    orden_pregunta: {
      type: DataTypes.INTEGER,
      allowNull: false,
      defaultValue: null,
      comment: null,
      primaryKey: false,
      field: "orden_pregunta",
      autoIncrement: false
    },
    recurso_multimedia: {
      type: DataTypes.CHAR(500),
      allowNull: true,
      defaultValue: null,
      comment: null,
      primaryKey: false,
      field: "recurso_multimedia",
      autoIncrement: false
    },
    instruccion_especial: {
      type: DataTypes.TEXT,
      allowNull: true,
      defaultValue: null,
      comment: null,
      primaryKey: false,
      field: "instruccion_especial",
      autoIncrement: false
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
    }
  };
  const options = {
    tableName: "preguntas_evaluacion",
    comment: "",
    indexes: []
  };
  const PreguntasEvaluacionModel = sequelize.define("preguntas_evaluacion_model", attributes, options);
  return PreguntasEvaluacionModel;
};