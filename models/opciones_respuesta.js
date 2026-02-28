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
    texto_opcion: {
      type: DataTypes.TEXT,
      allowNull: false,
      defaultValue: null,
      comment: null,
      primaryKey: false,
      field: "texto_opcion",
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
    orden_opcion: {
      type: DataTypes.INTEGER,
      allowNull: false,
      defaultValue: null,
      comment: null,
      primaryKey: false,
      field: "orden_opcion",
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
    tableName: "opciones_respuesta",
    comment: "",
    indexes: []
  };
  const OpcionesRespuestaModel = sequelize.define("opciones_respuesta_model", attributes, options);
  OpcionesRespuestaModel.associate = (models) => {
    OpcionesRespuestaModel.belongsTo(models.preguntas_evaluacion_model, { foreignKey: 'pregunta_id', as: 'pregunta' });
    OpcionesRespuestaModel.hasMany(models.respuestas_estudiante_model, { foreignKey: 'opcion_seleccionada_id', as: 'respuestas' });
  };
  return OpcionesRespuestaModel;
};