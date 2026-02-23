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
    evaluacion_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
      defaultValue: null,
      comment: null,
      primaryKey: false,
      field: "evaluacion_id",
      autoIncrement: false,
      references: {
        key: "id",
        model: "evaluaciones_model"
      }
    },
    puntaje: {
      type: DataTypes.DOUBLE,
      allowNull: true,
      defaultValue: null,
      comment: null,
      primaryKey: false,
      field: "puntaje",
      autoIncrement: false
    },
    tiempo_total: {
      type: DataTypes.INTEGER,
      allowNull: true,
      defaultValue: null,
      comment: null,
      primaryKey: false,
      field: "tiempo_total",
      autoIncrement: false
    },
    nivel_resultante: {
      type: DataTypes.CHAR(50),
      allowNull: true,
      defaultValue: null,
      comment: null,
      primaryKey: false,
      field: "nivel_resultante",
      autoIncrement: false
    },
    observaciones: {
      type: DataTypes.TEXT,
      allowNull: true,
      defaultValue: null,
      comment: null,
      primaryKey: false,
      field: "observaciones",
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
    tableName: "evaluaciones_usuarios",
    comment: "",
    indexes: [{
      name: "idx_evaluaciones_usuarios_evaluacion",
      unique: false,
      fields: ["evaluacion_id"]
    }, {
      name: "idx_evaluaciones_usuarios_usuario",
      unique: false,
      fields: ["usuario_id"]
    }, {
      name: "uq_usuario_evaluacion",
      unique: true,
      fields: ["usuario_id", "evaluacion_id"]
    }]
  };
  const EvaluacionesUsuariosModel = sequelize.define("evaluaciones_usuarios_model", attributes, options);

  // Associations
  EvaluacionesUsuariosModel.associate = models => {
    EvaluacionesUsuariosModel.belongsTo(models.usuarios_model, { foreignKey: "usuario_id", as: "usuario" });
    EvaluacionesUsuariosModel.belongsTo(models.evaluaciones_model, { foreignKey: "evaluacion_id", as: "evaluacion" });
    EvaluacionesUsuariosModel.hasMany(models.resultados_preguntas_model, { foreignKey: "evaluacion_usuario_id", as: "resultados_preguntas" });
  };
  return EvaluacionesUsuariosModel;
};