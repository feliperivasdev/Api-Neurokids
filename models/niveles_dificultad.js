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
      type: DataTypes.CHAR(50),
      allowNull: false,
      defaultValue: null,
      comment: null,
      primaryKey: false,
      field: "nombre",
      autoIncrement: false,
      unique: "niveles_dificultad_nombre_key"
    },
    descripcion: {
      type: DataTypes.TEXT,
      allowNull: true,
      defaultValue: null,
      comment: null,
      primaryKey: false,
      field: "descripcion",
      autoIncrement: false
    }
  };
  const options = {
    tableName: "niveles_dificultad",
    comment: "",
    indexes: []
  };
  const NivelesDificultadModel = sequelize.define("niveles_dificultad_model", attributes, options);

  // Associations
  NivelesDificultadModel.associate = models => {
    NivelesDificultadModel.hasMany(models.juegos_model, { foreignKey: "nivel_dificultad_id", as: "juegos" });
    NivelesDificultadModel.hasMany(models.lecturas_model, { foreignKey: "nivel_dificultad_id", as: "lecturas" });
  };
  return NivelesDificultadModel;
};