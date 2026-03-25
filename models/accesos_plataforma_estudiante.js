const { DataTypes } = require('sequelize');

module.exports = (sequelize) => {
  const attributes = {
    id: {
      type: DataTypes.BIGINT,
      allowNull: false,
      primaryKey: true,
      autoIncrement: true,
      field: 'id'
    },
    estudiante_id: {
      type: DataTypes.BIGINT,
      allowNull: false,
      field: 'estudiante_id',
      references: { key: 'id', model: 'estudiantes_model' }
    },
    fecha_hora: {
      type: DataTypes.DATE,
      allowNull: false,
      defaultValue: DataTypes.NOW,
      field: 'fecha_hora'
    },
    ip_address: {
      type: DataTypes.STRING(45),
      allowNull: true,
      field: 'ip_address'
    },
    user_agent: {
      type: DataTypes.TEXT,
      allowNull: true,
      field: 'user_agent'
    }
  };
  const options = {
    tableName: 'accesos_plataforma_estudiante',
    timestamps: false,
    underscored: true,
    freezeTableName: true,
    schema: 'public'
  };
  const AccesosPlataformaEstudianteModel = sequelize.define(
    'accesos_plataforma_estudiante_model',
    attributes,
    options
  );
  AccesosPlataformaEstudianteModel.associate = (models) => {
    AccesosPlataformaEstudianteModel.belongsTo(models.estudiantes_model, {
      foreignKey: 'estudiante_id',
      as: 'estudiante'
    });
  };
  return AccesosPlataformaEstudianteModel;
};
