const { DataTypes } = require('sequelize');

module.exports = sequelize => {
  const attributes = {
    id: {
      type: DataTypes.BIGINT,
      allowNull: false,
      primaryKey: true,
      field: "id",
      autoIncrement: true
    },
    estudiante_id: {
      type: DataTypes.BIGINT,
      allowNull: false,
      field: "estudiante_id",
      references: { key: "id", model: "estudiantes_model" }
    },
    actividad_id: {
      type: DataTypes.BIGINT,
      allowNull: false,
      field: "actividad_id",
      references: { key: "id", model: "actividades_model" }
    },
    nivel: {
      type: DataTypes.INTEGER,
      allowNull: true,
      defaultValue: 1,
      field: "nivel"
    },
    fecha: {
      type: DataTypes.DATE,
      allowNull: true,
      defaultValue: sequelize.fn('now'),
      field: "fecha"
    },
    duracion_seg: {
      type: DataTypes.INTEGER,
      allowNull: true,
      defaultValue: 0,
      field: "duracion_seg"
    },
    completado: {
      type: DataTypes.BOOLEAN,
      allowNull: true,
      defaultValue: false,
      field: "completado"
    },
    respuestas_correctas: {
      type: DataTypes.INTEGER,
      allowNull: true,
      defaultValue: 0,
      field: "respuestas_correctas"
    },
    respuestas_incorrectas: {
      type: DataTypes.INTEGER,
      allowNull: true,
      defaultValue: 0,
      field: "respuestas_incorrectas"
    },
    uso_audio: {
      type: DataTypes.INTEGER,
      allowNull: true,
      defaultValue: 0,
      field: "uso_audio"
    },
    puntuacion: {
      type: DataTypes.INTEGER,
      allowNull: true,
      defaultValue: 0,
      field: "puntuacion"
    },
    puntuacion_maxima: {
      type: DataTypes.INTEGER,
      allowNull: true,
      defaultValue: 100,
      field: "puntuacion_maxima"
    }
  };

  const options = {
    tableName: "sesiones_actividad",
    timestamps: false,
    underscored: true,
    freezeTableName: true,
    schema: 'public'
  };

  const SesionesActividadModel = sequelize.define("sesiones_actividad_model", attributes, options);
  SesionesActividadModel.associate = (models) => {
    SesionesActividadModel.belongsTo(models.estudiantes_model, { foreignKey: 'estudiante_id', as: 'estudiante' });
    SesionesActividadModel.belongsTo(models.actividades_model, { foreignKey: 'actividad_id', as: 'actividad' });
  };
  return SesionesActividadModel;
};
