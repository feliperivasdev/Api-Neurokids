const {
  DataTypes
} = require('sequelize');
module.exports = sequelize => {
  const attributes = {
    id: {
      type: DataTypes.CHAR(40),
      allowNull: false,
      defaultValue: null,
      comment: null,
      primaryKey: true,
      field: "id",
      autoIncrement: false
    },
    usuario_id: {
      type: DataTypes.BIGINT,
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
    estudiante_id: {
      type: DataTypes.BIGINT,
      allowNull: true,
      defaultValue: null,
      comment: null,
      primaryKey: false,
      field: "estudiante_id",
      autoIncrement: false,
      references: {
        key: "id",
        model: "estudiantes_model"
      }
    },
    ip_address: {
      type: inet,
      allowNull: true,
      defaultValue: null,
      comment: null,
      primaryKey: false,
      field: "ip_address",
      autoIncrement: false
    },
    user_agent: {
      type: DataTypes.TEXT,
      allowNull: true,
      defaultValue: null,
      comment: null,
      primaryKey: false,
      field: "user_agent",
      autoIncrement: false
    },
    payload: {
      type: DataTypes.TEXT,
      allowNull: false,
      defaultValue: null,
      comment: null,
      primaryKey: false,
      field: "payload",
      autoIncrement: false
    },
    last_activity: {
      type: DataTypes.BIGINT,
      allowNull: false,
      defaultValue: null,
      comment: null,
      primaryKey: false,
      field: "last_activity",
      autoIncrement: false
    }
  };
  const options = {
    tableName: "sesiones",
    comment: "",
    indexes: [{
      name: "idx_sesiones_estudiante",
      unique: false,
      fields: ["estudiante_id"]
    }, {
      name: "idx_sesiones_last_activity",
      unique: false,
      fields: ["last_activity"]
    }, {
      name: "idx_sesiones_usuario",
      unique: false,
      fields: ["usuario_id"]
    }],
    timestamps: false,
    underscored: true,
    freezeTableName: true,
    schema: 'public'
  };
  const SesionesModel = sequelize.define("sesiones_model", attributes, options);
  SesionesModel.associate = (models) => {
    SesionesModel.belongsTo(models.usuarios_model, { foreignKey: 'usuario_id', as: 'usuario' });
    SesionesModel.belongsTo(models.estudiantes_model, { foreignKey: 'estudiante_id', as: 'estudiante' });
  };
  return SesionesModel;
};