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
    titulo: {
      type: DataTypes.CHAR(200),
      allowNull: false,
      defaultValue: null,
      comment: null,
      primaryKey: false,
      field: "titulo",
      autoIncrement: false
    },
    contenido: {
      type: DataTypes.TEXT,
      allowNull: false,
      defaultValue: null,
      comment: null,
      primaryKey: false,
      field: "contenido",
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
    generada_por_ia: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: null,
      comment: null,
      primaryKey: false,
      field: "generada_por_ia",
      autoIncrement: false
    },
    fuente: {
      type: DataTypes.TEXT,
      allowNull: true,
      defaultValue: null,
      comment: null,
      primaryKey: false,
      field: "fuente",
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
    tableName: "lecturas",
    comment: "",
    indexes: [{
      name: "idx_lecturas_nivel",
      unique: false,
      fields: ["nivel_dificultad_id"]
    }, {
      name: "idx_lecturas_rango",
      unique: false,
      fields: ["rango_edad_id"]
    }]
  };
  const LecturasModel = sequelize.define("lecturas_model", attributes, options);
  return LecturasModel;
};