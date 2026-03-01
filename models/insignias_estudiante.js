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
    insignia_id: {
      type: DataTypes.BIGINT,
      allowNull: false,
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
    obtenido_at: {
      type: DataTypes.DATE,
      allowNull: true,
      defaultValue: sequelize.fn('now'),
      comment: null,
      primaryKey: false,
      field: "obtenido_at",
      autoIncrement: false
    },
    progreso_actual: {
      type: DataTypes.INTEGER,
      allowNull: true,
      defaultValue: "0",
      comment: null,
      primaryKey: false,
      field: "progreso_actual",
      autoIncrement: false
    },
    progreso_requerido: {
      type: DataTypes.INTEGER,
      allowNull: true,
      defaultValue: "1",
      comment: null,
      primaryKey: false,
      field: "progreso_requerido",
      autoIncrement: false
    },
    completado: {
      type: DataTypes.BOOLEAN,
      allowNull: true,
      defaultValue: null,
      comment: null,
      primaryKey: false,
      field: "completado",
      autoIncrement: false
    },
    notificado: {
      type: DataTypes.BOOLEAN,
      allowNull: true,
      defaultValue: null,
      comment: null,
      primaryKey: false,
      field: "notificado",
      autoIncrement: false
    },
    actividad_origen_id: {
      type: DataTypes.BIGINT,
      allowNull: true,
      defaultValue: null,
      comment: null,
      primaryKey: false,
      field: "actividad_origen_id",
      autoIncrement: false,
      references: {
        key: "id",
        model: "actividades_model"
      }
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
    tableName: "insignias_estudiante",
    comment: "",
    indexes: [{
      name: "idx_insignias_completado",
      unique: false,
      fields: ["completado"]
    }, {
      name: "idx_insignias_estudiante",
      unique: false,
      fields: ["estudiante_id"]
    }, {
      name: "insignias_estudiante_estudiante_id_insignia_id_key",
      unique: true,
      fields: ["estudiante_id", "insignia_id"]
    }],
    timestamps: false,
    underscored: true,
    freezeTableName: true,
    schema: 'public'
  };
  const InsigniasEstudianteModel = sequelize.define("insignias_estudiante_model", attributes, options);
  InsigniasEstudianteModel.associate = (models) => {
    InsigniasEstudianteModel.belongsTo(models.estudiantes_model, { foreignKey: 'estudiante_id', as: 'estudiante' });
    InsigniasEstudianteModel.belongsTo(models.insignias_model, { foreignKey: 'insignia_id', as: 'insignia' });
    InsigniasEstudianteModel.belongsTo(models.actividades_model, { foreignKey: 'actividad_origen_id', as: 'actividad' });
  };
  return InsigniasEstudianteModel;
};