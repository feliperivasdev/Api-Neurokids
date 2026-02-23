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
    lectura_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
      defaultValue: null,
      comment: null,
      primaryKey: false,
      field: "lectura_id",
      autoIncrement: false,
      references: {
        key: "id",
        model: "lecturas_model"
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
    puntuacion: {
      type: DataTypes.DOUBLE,
      allowNull: true,
      defaultValue: null,
      comment: null,
      primaryKey: false,
      field: "puntuacion",
      autoIncrement: false
    },
    tiempo_lectura_segundos: {
      type: DataTypes.INTEGER,
      allowNull: true,
      defaultValue: "0",
      comment: null,
      primaryKey: false,
      field: "tiempo_lectura_segundos",
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
    fecha_inicio: {
      type: DataTypes.DATE,
      allowNull: false,
      defaultValue: sequelize.fn('now'),
      comment: null,
      primaryKey: false,
      field: "fecha_inicio",
      autoIncrement: false
    },
    fecha_completada: {
      type: DataTypes.DATE,
      allowNull: true,
      defaultValue: null,
      comment: null,
      primaryKey: false,
      field: "fecha_completada",
      autoIncrement: false
    }
  };
  const options = {
    tableName: "usuarios_lecturas",
    comment: "",
    indexes: [{
      name: "idx_usuarios_lecturas_lectura",
      unique: false,
      fields: ["lectura_id"]
    }, {
      name: "idx_usuarios_lecturas_usuario",
      unique: false,
      fields: ["usuario_id"]
    }, {
      name: "uq_usuario_lectura",
      unique: true,
      fields: ["usuario_id", "lectura_id"]
    }]
  };
  const UsuariosLecturasModel = sequelize.define("usuarios_lecturas_model", attributes, options);

  // Associations
  UsuariosLecturasModel.associate = models => {
    UsuariosLecturasModel.belongsTo(models.usuarios_model, { foreignKey: "usuario_id", as: "usuario" });
    UsuariosLecturasModel.belongsTo(models.lecturas_model, { foreignKey: "lectura_id", as: "lectura" });
  };
  return UsuariosLecturasModel;
};