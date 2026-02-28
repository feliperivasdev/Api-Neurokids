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
    clave: {
      type: DataTypes.CHAR(255),
      allowNull: false,
      defaultValue: null,
      comment: null,
      primaryKey: false,
      field: "clave",
      autoIncrement: false,
      unique: "configuraciones_clave_key"
    },
    valor: {
      type: DataTypes.TEXT,
      allowNull: true,
      defaultValue: null,
      comment: null,
      primaryKey: false,
      field: "valor",
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
    tipo: {
      type: user - defined,
      allowNull: true,
      defaultValue: "string",
      comment: null,
      primaryKey: false,
      field: "tipo",
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
    tableName: "configuraciones",
    comment: "",
    indexes: [],
    timestamps: false,
    underscored: true,
    freezeTableName: true,
    schema: 'public'
  };
  const ConfiguracionesModel = sequelize.define("configuraciones_model", attributes, options);
  return ConfiguracionesModel;
};