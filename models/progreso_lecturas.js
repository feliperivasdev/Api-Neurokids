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
    porcentaje_leido: {
      type: DataTypes.DOUBLE,
      allowNull: true,
      defaultValue: "0.00",
      comment: null,
      primaryKey: false,
      field: "porcentaje_leido",
      autoIncrement: false
    },
    tiempo_total_lectura: {
      type: DataTypes.INTEGER,
      allowNull: true,
      defaultValue: "0",
      comment: null,
      primaryKey: false,
      field: "tiempo_total_lectura",
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
    completado_at: {
      type: DataTypes.DATE,
      allowNull: true,
      defaultValue: null,
      comment: null,
      primaryKey: false,
      field: "completado_at",
      autoIncrement: false
    },
    ultima_posicion: {
      type: DataTypes.INTEGER,
      allowNull: true,
      defaultValue: "0",
      comment: null,
      primaryKey: false,
      field: "ultima_posicion",
      autoIncrement: false
    },
    valoracion_estudiante: {
      type: DataTypes.INTEGER,
      allowNull: true,
      defaultValue: null,
      comment: null,
      primaryKey: false,
      field: "valoracion_estudiante",
      autoIncrement: false
    },
    comentario_estudiante: {
      type: DataTypes.TEXT,
      allowNull: true,
      defaultValue: null,
      comment: null,
      primaryKey: false,
      field: "comentario_estudiante",
      autoIncrement: false
    },
    palabras_consultadas: {
      type: DataTypes.JSONB,
      allowNull: true,
      defaultValue: null,
      comment: null,
      primaryKey: false,
      field: "palabras_consultadas",
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
    tableName: "progreso_lecturas",
    comment: "",
    indexes: [{
      name: "idx_progreso_lectura_estudiante",
      unique: false,
      fields: ["estudiante_id"]
    }, {
      name: "progreso_lecturas_estudiante_id_lectura_id_key",
      unique: true,
      fields: ["estudiante_id", "lectura_id"]
    }]
  };
  const ProgresoLecturasModel = sequelize.define("progreso_lecturas_model", attributes, options);
  ProgresoLecturasModel.associate = (models) => {
    ProgresoLecturasModel.belongsTo(models.estudiantes_model, { foreignKey: 'estudiante_id', as: 'estudiante' });
    ProgresoLecturasModel.belongsTo(models.lecturas_generadas_model, { foreignKey: 'lectura_id', as: 'lectura' });
    ProgresoLecturasModel.hasMany(models.respuestas_comprension_model, { foreignKey: 'progreso_lectura_id', as: 'respuestas' });
  };
  return ProgresoLecturasModel;
};