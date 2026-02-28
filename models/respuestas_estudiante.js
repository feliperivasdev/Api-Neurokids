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
    resultado_evaluacion_id: {
      type: DataTypes.BIGINT,
      allowNull: false,
      defaultValue: null,
      comment: null,
      primaryKey: false,
      field: "resultado_evaluacion_id",
      autoIncrement: false,
      references: {
        key: "id",
        model: "resultados_evaluacion_model"
      }
    },
    pregunta_id: {
      type: DataTypes.BIGINT,
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
        model: "opciones_respuesta_model"
      }
    },
    respuesta_texto: {
      type: DataTypes.TEXT,
      allowNull: true,
      defaultValue: null,
      comment: null,
      primaryKey: false,
      field: "respuesta_texto",
      autoIncrement: false
    },
    respuesta_audio: {
      type: DataTypes.CHAR(500),
      allowNull: true,
      defaultValue: null,
      comment: null,
      primaryKey: false,
      field: "respuesta_audio",
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
    tableName: "respuestas_estudiante",
    comment: "",
    indexes: [{
      name: "idx_respuestas_resultado",
      unique: false,
      fields: ["resultado_evaluacion_id"]
    }]
  };
  const RespuestasEstudianteModel = sequelize.define("respuestas_estudiante_model", attributes, options);
  RespuestasEstudianteModel.associate = (models) => {
    RespuestasEstudianteModel.belongsTo(models.resultados_evaluacion_model, { foreignKey: 'resultado_evaluacion_id', as: 'resultado' });
    RespuestasEstudianteModel.belongsTo(models.preguntas_evaluacion_model, { foreignKey: 'pregunta_id', as: 'pregunta' });
    RespuestasEstudianteModel.belongsTo(models.opciones_respuesta_model, { foreignKey: 'opcion_seleccionada_id', as: 'opcion' });
  };
  return RespuestasEstudianteModel;
};