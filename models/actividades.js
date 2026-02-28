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
      allowNull: true,
      defaultValue: null,
      comment: null,
      primaryKey: false,
      field: "descripcion",
      autoIncrement: false
    },
    tipo_actividad_id: {
      type: DataTypes.BIGINT,
      allowNull: false,
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
    grupo_edad_id: {
      type: DataTypes.BIGINT,
      allowNull: false,
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
    nivel: {
      type: DataTypes.INTEGER,
      allowNull: true,
      defaultValue: "1",
      comment: null,
      primaryKey: false,
      field: "nivel",
      autoIncrement: false
    },
    puntuacion_maxima: {
      type: DataTypes.INTEGER,
      allowNull: true,
      defaultValue: "100",
      comment: null,
      primaryKey: false,
      field: "puntuacion_maxima",
      autoIncrement: false
    },
    tiempo_estimado: {
      type: DataTypes.INTEGER,
      allowNull: true,
      defaultValue: null,
      comment: null,
      primaryKey: false,
      field: "tiempo_estimado",
      autoIncrement: false
    },
    ruta_recurso: {
      type: DataTypes.CHAR(500),
      allowNull: true,
      defaultValue: null,
      comment: null,
      primaryKey: false,
      field: "ruta_recurso",
      autoIncrement: false
    },
    instrucciones: {
      type: DataTypes.TEXT,
      allowNull: true,
      defaultValue: null,
      comment: null,
      primaryKey: false,
      field: "instrucciones",
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
    tableName: "actividades",
    comment: "",
    indexes: [{
      name: "idx_actividades_grupo_edad",
      unique: false,
      fields: ["grupo_edad_id"]
    }, {
      name: "idx_actividades_tipo",
      unique: false,
      fields: ["tipo_actividad_id"]
    }]
  };
  const ActividadesModel = sequelize.define("actividades_model", attributes, options);
  ActividadesModel.associate = (models) => {
    ActividadesModel.belongsTo(models.tipos_actividad_model, { foreignKey: 'tipo_actividad_id', as: 'tipo' });
    ActividadesModel.belongsTo(models.grupos_edad_model, { foreignKey: 'grupo_edad_id', as: 'grupoEdad' });
    ActividadesModel.hasMany(models.progreso_actividades_model, { foreignKey: 'actividad_id', as: 'progresos' });
    ActividadesModel.hasMany(models.insignias_estudiante_model, { foreignKey: 'actividad_origen_id', as: 'insigniasGeneradas' });
  };
  return ActividadesModel;
};