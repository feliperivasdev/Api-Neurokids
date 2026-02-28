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
    tiempo_limite: {
      type: DataTypes.INTEGER,
      allowNull: true,
      defaultValue: null,
      comment: null,
      primaryKey: false,
      field: "tiempo_limite",
      autoIncrement: false
    },
    numero_preguntas: {
      type: DataTypes.INTEGER,
      allowNull: false,
      defaultValue: null,
      comment: null,
      primaryKey: false,
      field: "numero_preguntas",
      autoIncrement: false
    },
    puntuacion_minima: {
      type: DataTypes.INTEGER,
      allowNull: true,
      defaultValue: "0",
      comment: null,
      primaryKey: false,
      field: "puntuacion_minima",
      autoIncrement: false
    },
    puntuacion_maxima: {
      type: DataTypes.INTEGER,
      allowNull: false,
      defaultValue: null,
      comment: null,
      primaryKey: false,
      field: "puntuacion_maxima",
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
    tableName: "evaluaciones_iniciales",
    comment: "",
    indexes: [],
    timestamps: false,
    underscored: true,
    freezeTableName: true,
    schema: 'public'
  };
  const EvaluacionesInicialesModel = sequelize.define("evaluaciones_iniciales_model", attributes, options);
  EvaluacionesInicialesModel.associate = (models) => {
    EvaluacionesInicialesModel.belongsTo(models.grupos_edad_model, { foreignKey: 'grupo_edad_id', as: 'grupoEdad' });
    EvaluacionesInicialesModel.hasMany(models.preguntas_evaluacion_model, { foreignKey: 'evaluacion_id', as: 'preguntas' });
    EvaluacionesInicialesModel.hasMany(models.resultados_evaluacion_model, { foreignKey: 'evaluacion_id', as: 'resultados' });
  };
  return EvaluacionesInicialesModel;
};