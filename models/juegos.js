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
      type: DataTypes.CHAR(150),
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
    nivel_dificultad_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
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
    rango_edad_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
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
    activo: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: null,
      comment: null,
      primaryKey: false,
      field: "activo",
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
    },
    updated_at: {
      type: DataTypes.DATE,
      allowNull: false,
      defaultValue: sequelize.fn('now'),
      comment: null,
      primaryKey: false,
      field: "updated_at",
      autoIncrement: false
    }
  };
  const options = {
    tableName: "juegos",
    comment: "",
    indexes: [{
      name: "idx_juegos_nivel",
      unique: false,
      fields: ["nivel_dificultad_id"]
    }, {
      name: "idx_juegos_rango",
      unique: false,
      fields: ["rango_edad_id"]
    }]
  };
  const JuegosModel = sequelize.define("juegos_model", attributes, options);

  // Associations
  JuegosModel.associate = models => {
    JuegosModel.hasMany(models.usuarios_juegos_model, { foreignKey: "juego_id", as: "usuarios_juegos" });
    JuegosModel.belongsTo(models.niveles_dificultad_model, { foreignKey: "nivel_dificultad_id", as: "nivel_dificultad" });
  };
  return JuegosModel;
};