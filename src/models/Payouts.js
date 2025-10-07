// models/Payout.js
const { Sequelize, DataTypes } = require('sequelize');

module.exports = (sequelize) => {
  const Payout = sequelize.define("Payout", {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true,
    },
    farmerId: { 
      type: DataTypes.UUID,
      allowNull: false,
    },
    amount: {
      type: DataTypes.FLOAT,
      allowNull: false,
    },
    status: {
      type: DataTypes.ENUM("pending", "approved", "rejected"),
      defaultValue: "pending",
    },
    reference: { // unique payout reference
      type: DataTypes.STRING,
      allowNull: false,
      unique: true,
    },
    note: { // optional note
      type: DataTypes.TEXT,
      allowNull: true,
    },
  },
  {
    tableName: 'payouts',
    timestamps: true,
    createdAt: 'created_at',
    updatedAt: 'updated_at',
  });

  Payout.associate = (models) => {
    Payout.belongsTo(models.User, { foreignKey: "farmerId", as: "farmer" });
  };

  return Payout;
};
