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
      unique: "tipos_actividad_nombre_key"
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
    tableName: "tipos_actividad",
    comment: "",
    indexes: []
  };
  const TiposActividadModel = sequelize.define("tipos_actividad_model", attributes, options);
  TiposActividadModel.associate = (models) => {
    TiposActividadModel.hasMany(models.actividades_model, { foreignKey: 'tipo_actividad_id', as: 'actividades' });
    TiposActividadModel.hasMany(models.criterios_insignias_model, { foreignKey: 'tipo_actividad_id', as: 'criterios' });
  };
  return TiposActividadModel;
};