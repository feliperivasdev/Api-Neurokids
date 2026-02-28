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
      type: user - defined,
      allowNull: false,
      defaultValue: null,
      comment: null,
      primaryKey: false,
      field: "nombre",
      autoIncrement: false,
      unique: "grupos_edad_nombre_key"
    },
    edad_minima: {
      type: DataTypes.INTEGER,
      allowNull: false,
      defaultValue: null,
      comment: null,
      primaryKey: false,
      field: "edad_minima",
      autoIncrement: false
    },
    edad_maxima: {
      type: DataTypes.INTEGER,
      allowNull: false,
      defaultValue: null,
      comment: null,
      primaryKey: false,
      field: "edad_maxima",
      autoIncrement: false
    },
    descripcion: {
      type: DataTypes.TEXT,
      allowNull: true,
      defaultValue: null,
      comment: null,
      primaryKey: false,
      field: "descripcion",
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
    tableName: "grupos_edad",
    comment: "",
    indexes: [],
    timestamps: false,
    underscored: true,
    freezeTableName: true,
    schema: 'public'
  };
  const GruposEdadModel = sequelize.define("grupos_edad_model", attributes, options);
  GruposEdadModel.associate = (models) => {
    GruposEdadModel.hasMany(models.actividades_model, { foreignKey: 'grupo_edad_id', as: 'actividades' });
    GruposEdadModel.hasMany(models.parametros_generacion_lectura_model, { foreignKey: 'grupo_edad_id', as: 'parametros' });
    GruposEdadModel.hasMany(models.evaluaciones_iniciales_model, { foreignKey: 'grupo_edad_id', as: 'evaluaciones' });
    GruposEdadModel.hasMany(models.lecturas_generadas_model, { foreignKey: 'grupo_edad_id', as: 'lecturas' });
    GruposEdadModel.hasMany(models.criterios_insignias_model, { foreignKey: 'grupo_edad_id', as: 'criterios' });
  };
  return GruposEdadModel;
};