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
    usuario_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
      defaultValue: null,
      comment: null,
      primaryKey: false,
      field: "usuario_id",
      autoIncrement: false,
      references: {
        key: "id",
        model: "usuarios_model"
      }
    },
    juego_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
      defaultValue: null,
      comment: null,
      primaryKey: false,
      field: "juego_id",
      autoIncrement: false,
      references: {
        key: "id",
        model: "juegos_model"
      }
    },
    completado: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: null,
      comment: null,
      primaryKey: false,
      field: "completado",
      autoIncrement: false
    },
    puntaje: {
      type: DataTypes.DOUBLE,
      allowNull: true,
      defaultValue: null,
      comment: null,
      primaryKey: false,
      field: "puntaje",
      autoIncrement: false
    },
    intentos: {
      type: DataTypes.INTEGER,
      allowNull: false,
      defaultValue: "0",
      comment: null,
      primaryKey: false,
      field: "intentos",
      autoIncrement: false
    },
    tiempo_total_segundos: {
      type: DataTypes.INTEGER,
      allowNull: true,
      defaultValue: "0",
      comment: null,
      primaryKey: false,
      field: "tiempo_total_segundos",
      autoIncrement: false
    },
    fecha_asignacion: {
      type: DataTypes.DATE,
      allowNull: false,
      defaultValue: sequelize.fn('now'),
      comment: null,
      primaryKey: false,
      field: "fecha_asignacion",
      autoIncrement: false
    },
    fecha_ultimo_intento: {
      type: DataTypes.DATE,
      allowNull: true,
      defaultValue: null,
      comment: null,
      primaryKey: false,
      field: "fecha_ultimo_intento",
      autoIncrement: false
    }
  };
  const options = {
    tableName: "usuarios_juegos",
    comment: "",
    indexes: [{
      name: "idx_usuarios_juegos_juego",
      unique: false,
      fields: ["juego_id"]
    }, {
      name: "idx_usuarios_juegos_usuario",
      unique: false,
      fields: ["usuario_id"]
    }, {
      name: "uq_usuario_juego",
      unique: true,
      fields: ["usuario_id", "juego_id"]
    }]
  };
  const UsuariosJuegosModel = sequelize.define("usuarios_juegos_model", attributes, options);
  return UsuariosJuegosModel;
};