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
    descripcion: {
      type: DataTypes.TEXT,
      allowNull: false,
      defaultValue: null,
      comment: null,
      primaryKey: false,
      field: "descripcion",
      autoIncrement: false
    },
    icono: {
      type: DataTypes.CHAR(500),
      allowNull: true,
      defaultValue: null,
      comment: null,
      primaryKey: false,
      field: "icono",
      autoIncrement: false
    },
    color_hex: {
      type: DataTypes.CHAR(7),
      allowNull: true,
      defaultValue: "#FFD700",
      comment: null,
      primaryKey: false,
      field: "color_hex",
      autoIncrement: false
    },
    categoria: {
      type: user - defined,
      allowNull: true,
      defaultValue: "progreso",
      comment: null,
      primaryKey: false,
      field: "categoria",
      autoIncrement: false
    },
    rareza: {
      type: user - defined,
      allowNull: true,
      defaultValue: "comun",
      comment: null,
      primaryKey: false,
      field: "rareza",
      autoIncrement: false
    },
    puntos_otorgados: {
      type: DataTypes.INTEGER,
      allowNull: true,
      defaultValue: "10",
      comment: null,
      primaryKey: false,
      field: "puntos_otorgados",
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
    orden_presentacion: {
      type: DataTypes.INTEGER,
      allowNull: true,
      defaultValue: "1",
      comment: null,
      primaryKey: false,
      field: "orden_presentacion",
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
    tableName: "insignias",
    comment: "",
    indexes: []
  };
  const InsigniasModel = sequelize.define("insignias_model", attributes, options);
  return InsigniasModel;
};