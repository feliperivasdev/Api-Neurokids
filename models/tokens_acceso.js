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
    usuario_id: {
      type: DataTypes.BIGINT,
      allowNull: true,
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
    token_hash: {
      type: DataTypes.CHAR(255),
      allowNull: false,
      defaultValue: null,
      comment: null,
      primaryKey: false,
      field: "token_hash",
      autoIncrement: false
    },
    tipo_token: {
      type: user - defined,
      allowNull: true,
      defaultValue: "access",
      comment: null,
      primaryKey: false,
      field: "tipo_token",
      autoIncrement: false
    },
    expires_at: {
      type: DataTypes.DATE,
      allowNull: false,
      defaultValue: null,
      comment: null,
      primaryKey: false,
      field: "expires_at",
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
    tableName: "tokens_acceso",
    comment: "",
    indexes: [{
      name: "idx_tokens_expires",
      unique: false,
      fields: ["expires_at"]
    }, {
      name: "idx_tokens_hash",
      unique: false,
      fields: ["token_hash"]
    }],
    timestamps: false,
    underscored: true,
    freezeTableName: true,
    schema: 'public'
  };
  const TokensAccesoModel = sequelize.define("tokens_acceso_model", attributes, options);
  TokensAccesoModel.associate = (models) => {
    TokensAccesoModel.belongsTo(models.usuarios_model, { foreignKey: 'usuario_id', as: 'usuario' });
    TokensAccesoModel.belongsTo(models.estudiantes_model, { foreignKey: 'estudiante_id', as: 'estudiante' });
  };
  return TokensAccesoModel;
};