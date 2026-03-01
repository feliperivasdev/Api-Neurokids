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
    titulo: {
      type: DataTypes.CHAR(255),
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
    resumen: {
      type: DataTypes.TEXT,
      allowNull: true,
      defaultValue: null,
      comment: null,
      primaryKey: false,
      field: "resumen",
      autoIncrement: false
    },
    parametro_generacion_id: {
      type: DataTypes.BIGINT,
      allowNull: false,
      defaultValue: null,
      comment: null,
      primaryKey: false,
      field: "parametro_generacion_id",
      autoIncrement: false,
      references: {
        key: "id",
        model: "parametros_generacion_lectura_model"
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
    nivel_lectura: {
      type: DataTypes.STRING,
      allowNull: true,
      defaultValue: "básico",
      comment: null,
      primaryKey: false,
      field: "nivel_lectura",
      autoIncrement: false
    },
    temas_abordados: {
      type: DataTypes.JSONB,
      allowNull: true,
      defaultValue: null,
      comment: null,
      primaryKey: false,
      field: "temas_abordados",
      autoIncrement: false
    },
    numero_palabras: {
      type: DataTypes.INTEGER,
      allowNull: true,
      defaultValue: null,
      comment: null,
      primaryKey: false,
      field: "numero_palabras",
      autoIncrement: false
    },
    tiempo_lectura_estimado: {
      type: DataTypes.INTEGER,
      allowNull: true,
      defaultValue: null,
      comment: null,
      primaryKey: false,
      field: "tiempo_lectura_estimado",
      autoIncrement: false
    },
    imagen_portada: {
      type: DataTypes.CHAR(500),
      allowNull: true,
      defaultValue: null,
      comment: null,
      primaryKey: false,
      field: "imagen_portada",
      autoIncrement: false
    },
    archivo_audio: {
      type: DataTypes.CHAR(500),
      allowNull: true,
      defaultValue: null,
      comment: null,
      primaryKey: false,
      field: "archivo_audio",
      autoIncrement: false
    },
    modelo_ia_usado: {
      type: DataTypes.CHAR(100),
      allowNull: true,
      defaultValue: null,
      comment: null,
      primaryKey: false,
      field: "modelo_ia_usado",
      autoIncrement: false
    },
    prompt_generacion: {
      type: DataTypes.TEXT,
      allowNull: true,
      defaultValue: null,
      comment: null,
      primaryKey: false,
      field: "prompt_generacion",
      autoIncrement: false
    },
    fecha_generacion: {
      type: DataTypes.DATE,
      allowNull: true,
      defaultValue: sequelize.fn('now'),
      comment: null,
      primaryKey: false,
      field: "fecha_generacion",
      autoIncrement: false
    },
    estado: {
      type: DataTypes.STRING,
      allowNull: true,
      defaultValue: "generando",
      comment: null,
      primaryKey: false,
      field: "estado",
      autoIncrement: false
    },
    aprobado_docente: {
      type: DataTypes.BOOLEAN,
      allowNull: true,
      defaultValue: null,
      comment: null,
      primaryKey: false,
      field: "aprobado_docente",
      autoIncrement: false
    },
    docente_revisor_id: {
      type: DataTypes.BIGINT,
      allowNull: true,
      defaultValue: null,
      comment: null,
      primaryKey: false,
      field: "docente_revisor_id",
      autoIncrement: false,
      references: {
        key: "id",
        model: "usuarios_model"
      }
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
    tableName: "lecturas_generadas",
    comment: "",
    indexes: [{
      name: "idx_lecturas_estado",
      unique: false,
      fields: ["estado"]
    }, {
      name: "idx_lecturas_estudiante",
      unique: false,
      fields: ["estudiante_id"]
    }, {
      name: "idx_lecturas_grupo_edad",
      unique: false,
      fields: ["grupo_edad_id"]
    }],
    timestamps: false,
    underscored: true,
    freezeTableName: true,
    schema: 'public'
  };
  const LecturasGeneradasModel = sequelize.define("lecturas_generadas_model", attributes, options);
  LecturasGeneradasModel.associate = (models) => {
    LecturasGeneradasModel.belongsTo(models.parametros_generacion_lectura_model, { foreignKey: 'parametro_generacion_id', as: 'parametro' });
    LecturasGeneradasModel.belongsTo(models.estudiantes_model, { foreignKey: 'estudiante_id', as: 'estudiante' });
    LecturasGeneradasModel.belongsTo(models.grupos_edad_model, { foreignKey: 'grupo_edad_id', as: 'grupoEdad' });
    LecturasGeneradasModel.belongsTo(models.usuarios_model, { foreignKey: 'docente_revisor_id', as: 'docenteRevisor' });
    LecturasGeneradasModel.hasMany(models.progreso_lecturas_model, { foreignKey: 'lectura_id', as: 'progresos' });
    LecturasGeneradasModel.hasMany(models.preguntas_comprension_lectura_model, { foreignKey: 'lectura_id', as: 'preguntas' });
    LecturasGeneradasModel.hasMany(models.feedback_lecturas_ia_model, { foreignKey: 'lectura_id', as: 'feedbacks' });
  };
  return LecturasGeneradasModel;
};