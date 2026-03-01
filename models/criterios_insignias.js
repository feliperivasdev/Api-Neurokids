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
    tipo_criterio: {
      type: DataTypes.STRING,
      allowNull: false,
      defaultValue: null,
      comment: null,
      primaryKey: false,
      field: "tipo_criterio",
      autoIncrement: false
    },
    valor_requerido: {
      type: DataTypes.INTEGER,
      allowNull: false,
      defaultValue: null,
      comment: null,
      primaryKey: false,
      field: "valor_requerido",
      autoIncrement: false
    },
    grupo_edad_id: {
      type: DataTypes.BIGINT,
      allowNull: true,
      defaultValue: null,
      comment: null,
      primaryKey: false,
      field: "grupo_edad_id",
      autoIncrement: false,
      references: {
        key: "id",
        model: "grupos_edad_model"
      }
    },
    tipo_actividad_id: {
      type: DataTypes.BIGINT,
      allowNull: true,
      defaultValue: null,
      comment: null,
      primaryKey: false,
      field: "tipo_actividad_id",
      autoIncrement: false,
      references: {
        key: "id",
        model: "tipos_actividad_model"
      }
    },
    condicion_adicional: {
      type: DataTypes.JSONB,
      allowNull: true,
      defaultValue: null,
      comment: null,
      primaryKey: false,
      field: "condicion_adicional",
      autoIncrement: false
    },
    descripcion_criterio: {
      type: DataTypes.TEXT,
      allowNull: true,
      defaultValue: null,
      comment: null,
      primaryKey: false,
      field: "descripcion_criterio",
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
    tableName: "criterios_insignias",
    comment: "",
    indexes: [{
      name: "idx_criterios_insignia",
      unique: false,
      fields: ["insignia_id"]
    }],
    timestamps: false,
    underscored: true,
    freezeTableName: true,
    schema: 'public'
  };
  const CriteriosInsigniasModel = sequelize.define("criterios_insignias_model", attributes, options);
  CriteriosInsigniasModel.associate = (models) => {
    CriteriosInsigniasModel.belongsTo(models.insignias_model, { foreignKey: 'insignia_id', as: 'insignia' });
    CriteriosInsigniasModel.belongsTo(models.grupos_edad_model, { foreignKey: 'grupo_edad_id', as: 'grupoEdad' });
    CriteriosInsigniasModel.belongsTo(models.tipos_actividad_model, { foreignKey: 'tipo_actividad_id', as: 'tipoActividad' });
  };
  return CriteriosInsigniasModel;
};