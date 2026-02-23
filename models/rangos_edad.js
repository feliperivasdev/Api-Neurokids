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
    edad_min: {
      type: DataTypes.INTEGER,
      allowNull: false,
      defaultValue: null,
      comment: null,
      primaryKey: false,
      field: "edad_min",
      autoIncrement: false
    },
    edad_max: {
      type: DataTypes.INTEGER,
      allowNull: false,
      defaultValue: null,
      comment: null,
      primaryKey: false,
      field: "edad_max",
      autoIncrement: false
    },
    descripcion: {
      type: DataTypes.CHAR(120),
      allowNull: true,
      defaultValue: null,
      comment: null,
      primaryKey: false,
      field: "descripcion",
      autoIncrement: false
    }
  };
  const options = {
    tableName: "rangos_edad",
    comment: "",
    indexes: [{
      name: "rangos_edad_unique_range",
      unique: true,
      fields: ["edad_min", "edad_max"]
    }]
  };
  const RangosEdadModel = sequelize.define("rangos_edad_model", attributes, options);

  // Associations
  RangosEdadModel.associate = models => {
    // Aquí puedes agregar asociaciones si hay modelos relacionados
  };
  return RangosEdadModel;
};