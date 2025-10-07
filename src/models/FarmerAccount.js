// models/FarmerAccount.js
const { Sequelize, DataTypes } = require('sequelize');

module.exports = (sequelize) => {
  const FarmerAccount = sequelize.define("FarmerAccount", {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true,
    },
    farmerId: {
      type: DataTypes.UUID,
      allowNull: false,
    },
    bankName: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    accountNumber: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    accountName: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    mobileMoneyProvider: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    mobileMoneyNumber: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    notes: {
      type: DataTypes.TEXT,
      allowNull: true,
    }
  },
  {
    tableName: 'farmer_accounts',
    timestamps: true,
    createdAt: 'created_at',
    updatedAt: 'updated_at',
  });

  FarmerAccount.associate = (models) => {
    FarmerAccount.belongsTo(models.User, { foreignKey: "farmerId", as: "farmer" });
    FarmerAccount.hasMany(models.Payout, { foreignKey: "farmerAccountId", as: "payouts" });
  };

  return FarmerAccount;
};
