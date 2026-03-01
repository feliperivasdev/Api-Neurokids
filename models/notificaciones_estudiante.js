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
      autoIncrement: true
    },
    estudiante_id: {
      type: DataTypes.BIGINT,
      allowNull: false,
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
    tipo_notificacion: {
      type: DataTypes.STRING,
      allowNull: false,
      defaultValue: null,
      comment: null,
      primaryKey: false,
      field: "tipo_notificacion",
      autoIncrement: false
    },
    titulo: {
      type: DataTypes.CHAR(255),
      allowNull: false,
      defaultValue: null,
      comment: null,
      primaryKey: false,
      field: "titulo",
      autoIncrement: false
    },
    mensaje: {
      type: DataTypes.TEXT,
      allowNull: false,
      defaultValue: null,
      comment: null,
      primaryKey: false,
      field: "mensaje",
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
    leida: {
      type: DataTypes.BOOLEAN,
      allowNull: true,
      defaultValue: null,
      comment: null,
      primaryKey: false,
      field: "leida",
      autoIncrement: false
    },
    insignia_relacionada_id: {
      type: DataTypes.BIGINT,
      allowNull: true,
      defaultValue: null,
      comment: null,
      primaryKey: false,
      field: "insignia_relacionada_id",
      autoIncrement: false,
      references: {
        key: "id",
        model: "insignias_model"
      }
    },
    prioridad: {
      type: DataTypes.STRING,
      allowNull: true,
      defaultValue: "media",
      comment: null,
      primaryKey: false,
      field: "prioridad",
      autoIncrement: false
    },
    expires_at: {
      type: DataTypes.DATE,
      allowNull: true,
      defaultValue: null,
      comment: null,
      primaryKey: false,
      field: "expires_at",
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
    tableName: "notificaciones_estudiante",
    comment: "",
    indexes: [{
      name: "idx_notificaciones_estudiante",
      unique: false,
      fields: ["estudiante_id"]
    }, {
      name: "idx_notificaciones_leida",
      unique: false,
      fields: ["leida"]
    }],
    timestamps: false,
    underscored: true,
    freezeTableName: true,
    schema: 'public'
  };
  const NotificacionesEstudianteModel = sequelize.define("notificaciones_estudiante_model", attributes, options);
  NotificacionesEstudianteModel.associate = (models) => {
    NotificacionesEstudianteModel.belongsTo(models.estudiantes_model, { foreignKey: 'estudiante_id', as: 'estudiante' });
    NotificacionesEstudianteModel.belongsTo(models.insignias_model, { foreignKey: 'insignia_relacionada_id', as: 'insignia' });
  };
  return NotificacionesEstudianteModel;
};