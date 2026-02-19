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
    migration: {
      type: DataTypes.CHAR(255),
      allowNull: false,
      defaultValue: null,
      comment: null,
      primaryKey: false,
      field: "migration",
      autoIncrement: false
    },
    batch: {
      type: DataTypes.INTEGER,
      allowNull: false,
      defaultValue: null,
      comment: null,
      primaryKey: false,
      field: "batch",
      autoIncrement: false
    }
  };
  const options = {
    tableName: "migrations",
    comment: "",
    indexes: []
  };
  const MigrationsModel = sequelize.define("migrations_model", attributes, options);
  return MigrationsModel;
};