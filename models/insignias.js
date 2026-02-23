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
    nombre: {
      type: DataTypes.CHAR(100),
      allowNull: false,
      defaultValue: null,
      comment: null,
      primaryKey: false,
      field: "nombre",
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
    url_icono: {
      type: DataTypes.TEXT,
      allowNull: true,
      defaultValue: null,
      comment: null,
      primaryKey: false,
      field: "url_icono",
      autoIncrement: false
    },
    categoria: {
      type: DataTypes.CHAR(100),
      allowNull: false,
      defaultValue: null,
      comment: null,
      primaryKey: false,
      field: "categoria",
      autoIncrement: false
    },
    nivel_requerido: {
      type: DataTypes.INTEGER,
      allowNull: true,
      defaultValue: "0",
      comment: null,
      primaryKey: false,
      field: "nivel_requerido",
      autoIncrement: false
    }
  };
  const options = {
    tableName: "insignias",
    comment: "",
    indexes: [{
      name: "idx_insignias_categoria",
      unique: false,
      fields: ["categoria"]
    }]
  };
  const InsigniasModel = sequelize.define("insignias_model", attributes, options);

  // Associations
  InsigniasModel.associate = models => {
    InsigniasModel.hasMany(models.usuarios_insignias_model, { foreignKey: "insignia_id", as: "usuarios_insignias" });
  };
  return InsigniasModel;
};