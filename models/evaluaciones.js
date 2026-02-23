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
    nombre: {
      type: DataTypes.CHAR(200),
      allowNull: false,
      defaultValue: null,
      comment: null,
      primaryKey: false,
      field: "nombre",
      autoIncrement: false
    },
    tipo: {
      type: user - defined,
      allowNull: false,
      defaultValue: "diagnostico",
      comment: null,
      primaryKey: false,
      field: "tipo",
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
    rango_edad_id: {
      type: DataTypes.INTEGER,
      allowNull: true,
      defaultValue: null,
      comment: null,
      primaryKey: false,
      field: "rango_edad_id",
      autoIncrement: false,
      references: {
        key: "id",
        model: "rangos_edad_model"
      }
    },
    nivel_dificultad_id: {
      type: DataTypes.INTEGER,
      allowNull: true,
      defaultValue: null,
      comment: null,
      primaryKey: false,
      field: "nivel_dificultad_id",
      autoIncrement: false,
      references: {
        key: "id",
        model: "niveles_dificultad_model"
      }
    },
    generada_por_ia: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: null,
      comment: null,
      primaryKey: false,
      field: "generada_por_ia",
      autoIncrement: false
    },
    created_at: {
      type: DataTypes.DATE,
      allowNull: false,
      defaultValue: sequelize.fn('now'),
      comment: null,
      primaryKey: false,
      field: "created_at",
      autoIncrement: false
    }
  };
  const options = {
    tableName: "evaluaciones",
    comment: "",
    indexes: [{
      name: "idx_evaluaciones_rango",
      unique: false,
      fields: ["rango_edad_id"]
    }]
  };
  const EvaluacionesModel = sequelize.define("evaluaciones_model", attributes, options);

  // Associations
  EvaluacionesModel.associate = models => {
    EvaluacionesModel.hasMany(models.evaluaciones_usuarios_model, { foreignKey: "evaluacion_id", as: "usuarios_evaluaciones" });
    EvaluacionesModel.hasMany(models.preguntas_evaluacion_model, { foreignKey: "evaluacion_id", as: "preguntas" });
  };
  return EvaluacionesModel;
};