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
    lectura_id: {
      type: DataTypes.BIGINT,
      allowNull: false,
      defaultValue: null,
      comment: null,
      primaryKey: false,
      field: "lectura_id",
      autoIncrement: false,
      references: {
        key: "id",
        model: "lecturas_generadas_model"
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
      type: DataTypes.STRING,
      allowNull: true,
      defaultValue: "multiple_choice",
      comment: null,
      primaryKey: false,
      field: "tipo_pregunta",
      autoIncrement: false
    },
    nivel_dificultad: {
      type: DataTypes.STRING,
      allowNull: true,
      defaultValue: "medio",
      comment: null,
      primaryKey: false,
      field: "nivel_dificultad",
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
    orden_pregunta: {
      type: DataTypes.INTEGER,
      allowNull: false,
      defaultValue: null,
      comment: null,
      primaryKey: false,
      field: "orden_pregunta",
      autoIncrement: false
    },
    generada_por_ia: {
      type: DataTypes.BOOLEAN,
      allowNull: true,
      defaultValue: null,
      comment: null,
      primaryKey: false,
      field: "generada_por_ia",
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
    tableName: "preguntas_comprension_lectura",
    comment: "",
    indexes: [{
      name: "idx_preguntas_lectura",
      unique: false,
      fields: ["lectura_id"]
    }],
    timestamps: false,
    underscored: true,
    freezeTableName: true,
    schema: 'public'
  };
  const PreguntasComprensionLecturaModel = sequelize.define("preguntas_comprension_lectura_model", attributes, options);
  PreguntasComprensionLecturaModel.associate = (models) => {
    PreguntasComprensionLecturaModel.belongsTo(models.lecturas_generadas_model, { foreignKey: 'lectura_id', as: 'lectura' });
    PreguntasComprensionLecturaModel.hasMany(models.opciones_comprension_lectura_model, { foreignKey: 'pregunta_comprension_id', as: 'opciones' });
    PreguntasComprensionLecturaModel.hasMany(models.respuestas_comprension_model, { foreignKey: 'pregunta_comprension_id', as: 'respuestas' });
  };
  return PreguntasComprensionLecturaModel;
};