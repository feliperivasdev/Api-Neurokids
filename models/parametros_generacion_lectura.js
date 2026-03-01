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
    nombre: {
      type: DataTypes.CHAR(255),
      allowNull: false,
      defaultValue: null,
      comment: null,
      primaryKey: false,
      field: "nombre",
      autoIncrement: false
    },
    grupo_edad_id: {
      type: DataTypes.BIGINT,
      allowNull: false,
      defaultValue: null,
      comment: null,
      primaryKey: false,
      field: "grupo_edad_id",
      autoIncrement: false,
      references: {
        key: "id",
        model: "grupos_edad_model"
      }
    },
    nivel_lectura: {
      type: DataTypes.STRING,
      allowNull: true,
      defaultValue: "básico",
      comment: null,
      primaryKey: false,
      field: "nivel_lectura",
      autoIncrement: false
    },
    temas_preferidos: {
      type: DataTypes.JSONB,
      allowNull: true,
      defaultValue: null,
      comment: null,
      primaryKey: false,
      field: "temas_preferidos",
      autoIncrement: false
    },
    longitud_palabras: {
      type: DataTypes.CHAR(50),
      allowNull: true,
      defaultValue: null,
      comment: null,
      primaryKey: false,
      field: "longitud_palabras",
      autoIncrement: false
    },
    tipo_narrativa: {
      type: DataTypes.STRING,
      allowNull: true,
      defaultValue: "cuento",
      comment: null,
      primaryKey: false,
      field: "tipo_narrativa",
      autoIncrement: false
    },
    incluir_imagenes: {
      type: DataTypes.BOOLEAN,
      allowNull: true,
      defaultValue: null,
      comment: null,
      primaryKey: false,
      field: "incluir_imagenes",
      autoIncrement: false
    },
    incluir_audio: {
      type: DataTypes.BOOLEAN,
      allowNull: true,
      defaultValue: null,
      comment: null,
      primaryKey: false,
      field: "incluir_audio",
      autoIncrement: false
    },
    dificultad_vocabulario: {
      type: DataTypes.STRING,
      allowNull: true,
      defaultValue: "simple",
      comment: null,
      primaryKey: false,
      field: "dificultad_vocabulario",
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
    tableName: "parametros_generacion_lectura",
    comment: "",
    indexes: [],
    timestamps: false,
    underscored: true,
    freezeTableName: true,
    schema: 'public'
  };
  const ParametrosGeneracionLecturaModel = sequelize.define("parametros_generacion_lectura_model", attributes, options);
  ParametrosGeneracionLecturaModel.associate = (models) => {
    ParametrosGeneracionLecturaModel.belongsTo(models.grupos_edad_model, { foreignKey: 'grupo_edad_id', as: 'grupoEdad' });
    ParametrosGeneracionLecturaModel.hasMany(models.lecturas_generadas_model, { foreignKey: 'parametro_generacion_id', as: 'lecturas' });
  };
  return ParametrosGeneracionLecturaModel;
};