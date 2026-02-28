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
    lectura_id: {
      type: DataTypes.BIGINT,
      allowNull: false,
      defaultValue: null,
      comment: null,
      primaryKey: false,
      field: "lectura_id",
      autoIncrement: false,
      references: {
        key: "id",
        model: "lecturas_generadas_model"
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
    docente_id: {
      type: DataTypes.BIGINT,
      allowNull: true,
      defaultValue: null,
      comment: null,
      primaryKey: false,
      field: "docente_id",
      autoIncrement: false,
      references: {
        key: "id",
        model: "usuarios_model"
      }
    },
    tipo_feedback: {
      type: user - defined,
      allowNull: true,
      defaultValue: "estudiante",
      comment: null,
      primaryKey: false,
      field: "tipo_feedback",
      autoIncrement: false
    },
    valoracion: {
      type: DataTypes.INTEGER,
      allowNull: true,
      defaultValue: null,
      comment: null,
      primaryKey: false,
      field: "valoracion",
      autoIncrement: false
    },
    comentarios: {
      type: DataTypes.TEXT,
      allowNull: true,
      defaultValue: null,
      comment: null,
      primaryKey: false,
      field: "comentarios",
      autoIncrement: false
    },
    aspectos_mejora: {
      type: DataTypes.JSONB,
      allowNull: true,
      defaultValue: null,
      comment: null,
      primaryKey: false,
      field: "aspectos_mejora",
      autoIncrement: false
    },
    usado_para_mejora: {
      type: DataTypes.BOOLEAN,
      allowNull: true,
      defaultValue: null,
      comment: null,
      primaryKey: false,
      field: "usado_para_mejora",
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
    tableName: "feedback_lecturas_ia",
    comment: "",
    indexes: [{
      name: "idx_feedback_lectura",
      unique: false,
      fields: ["lectura_id"]
    }]
  };
  const FeedbackLecturasIaModel = sequelize.define("feedback_lecturas_ia_model", attributes, options);
  return FeedbackLecturasIaModel;
};