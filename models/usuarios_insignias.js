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
      allowNull: true,
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
    insignia_id: {
      type: DataTypes.INTEGER,
      allowNull: true,
      defaultValue: null,
      comment: null,
      primaryKey: false,
      field: "insignia_id",
      autoIncrement: false,
      references: {
        key: "id",
        model: "insignias_model"
      }
    },
    fecha_otorgada: {
      type: DataTypes.DATE,
      allowNull: true,
      defaultValue: sequelize.literal('CURRENT_TIMESTAMP'),
      comment: null,
      primaryKey: false,
      field: "fecha_otorgada",
      autoIncrement: false
    }
  };
  const options = {
    tableName: "usuarios_insignias",
    comment: "",
    indexes: [{
      name: "idx_usuarios_insignias_insignia",
      unique: false,
      fields: ["insignia_id"]
    }, {
      name: "idx_usuarios_insignias_usuario",
      unique: false,
      fields: ["usuario_id"]
    }, {
      name: "uq_usuario_insignia",
      unique: true,
      fields: ["usuario_id", "insignia_id"]
    }]
  };
  const UsuariosInsigniasModel = sequelize.define("usuarios_insignias_model", attributes, options);
  return UsuariosInsigniasModel;
};