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
    num_documento: {
      type: DataTypes.TEXT,
      allowNull: true,
      defaultValue: null,
      comment: null,
      primaryKey: false,
      field: "num_documento",
      autoIncrement: false,
      unique: "usuarios_num_documento_key"
    },
    nombre: {
      type: DataTypes.TEXT,
      allowNull: false,
      defaultValue: null,
      comment: null,
      primaryKey: false,
      field: "nombre",
      autoIncrement: false
    },
    apellido: {
      type: DataTypes.TEXT,
      allowNull: false,
      defaultValue: null,
      comment: null,
      primaryKey: false,
      field: "apellido",
      autoIncrement: false
    },
    edad: {
      type: DataTypes.TEXT,
      allowNull: true,
      defaultValue: null,
      comment: null,
      primaryKey: false,
      field: "edad",
      autoIncrement: false
    },
    correo: {
      type: DataTypes.TEXT,
      allowNull: true,
      defaultValue: null,
      comment: null,
      primaryKey: false,
      field: "correo",
      autoIncrement: false
    },
    contrasena_hash: {
      type: DataTypes.TEXT,
      allowNull: false,
      defaultValue: null,
      comment: null,
      primaryKey: false,
      field: "contrasena_hash",
      autoIncrement: false
    },
    rol_id: {
      type: DataTypes.INTEGER,
      allowNull: true,
      defaultValue: null,
      comment: null,
      primaryKey: false,
      field: "rol_id",
      autoIncrement: false,
      references: {
        key: "id",
        model: "roles_model"
      }
    },
    institucion_id: {
      type: DataTypes.INTEGER,
      allowNull: true,
      defaultValue: null,
      comment: null,
      primaryKey: false,
      field: "institucion_id",
      autoIncrement: false,
      references: {
        key: "id",
        model: "instituciones_model"
      }
    },
    fecha_creacion: {
      type: DataTypes.DATE,
      allowNull: true,
      defaultValue: null,
      comment: null,
      primaryKey: false,
      field: "fecha_creacion",
      autoIncrement: false
    },
    estado: {
      type: DataTypes.TEXT,
      allowNull: true,
      defaultValue: null,
      comment: null,
      primaryKey: false,
      field: "estado",
      autoIncrement: false
    },
    codigo_estudiante: {
      type: DataTypes.CHAR(100),
      allowNull: true,
      defaultValue: null,
      comment: null,
      primaryKey: false,
      field: "codigo_estudiante",
      autoIncrement: false,
      unique: "usuarios_codigo_estudiante_key"
    },
    nivel_actual: {
      type: DataTypes.INTEGER,
      allowNull: true,
      defaultValue: "1",
      comment: null,
      primaryKey: false,
      field: "nivel_actual",
      autoIncrement: false
    }
  };
  const options = {
    tableName: "usuarios",
    comment: "",
    indexes: [{
      name: "idx_usuarios_nivel_actual",
      unique: false,
      fields: ["nivel_actual"]
    }]
  };
  const UsuariosModel = sequelize.define("usuarios_model", attributes, options);

  // Associations
  UsuariosModel.associate = models => {
    UsuariosModel.belongsTo(models.roles_model, { foreignKey: "rol_id", as: "rol" });
    UsuariosModel.belongsTo(models.instituciones_model, { foreignKey: "institucion_id", as: "institucion" });
    UsuariosModel.hasMany(models.evaluaciones_usuarios_model, { foreignKey: "usuario_id", as: "evaluaciones_usuarios" });
    UsuariosModel.hasMany(models.usuarios_insignias_model, { foreignKey: "usuario_id", as: "insignias_usuario" });
    UsuariosModel.hasMany(models.usuarios_juegos_model, { foreignKey: "usuario_id", as: "juegos_usuario" });
    UsuariosModel.hasMany(models.usuarios_lecturas_model, { foreignKey: "usuario_id", as: "lecturas_usuario" });
  };
  return UsuariosModel;
};