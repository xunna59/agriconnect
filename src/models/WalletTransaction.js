// models/WalletTransaction.js
const { Sequelize, DataTypes } = require('sequelize');

module.exports = (sequelize) => {
  const WalletTransaction = sequelize.define("WalletTransaction", {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true,
    },
    userId: { // the farmer or buyer
      type: DataTypes.UUID,
      allowNull: false,
    },
    amount: {
      type: DataTypes.FLOAT,
      allowNull: false,
    },
    type: {
      type: DataTypes.ENUM("credit", "debit", "escrow_hold", "escrow_release"),
      allowNull: false,
    },
    reference: { // e.g., orderId or payout reference
      type: DataTypes.STRING,
      allowNull: true,
    },
    note: { // optional description
      type: DataTypes.TEXT,
      allowNull: true,
    },
  },
  {
    tableName: 'wallet_transactions',
    timestamps: true,
    createdAt: 'created_at',
    updatedAt: 'updated_at',
  });

  WalletTransaction.associate = (models) => {
    WalletTransaction.belongsTo(models.User, { foreignKey: "userId", as: "user" });
  };

  return WalletTransaction;
};
