// models/FarmerProfile.js
const { Sequelize, DataTypes } = require('sequelize');

module.exports = (sequelize) => {
  const FarmerProfile = sequelize.define("FarmerProfile", {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true,
    },
    userId: {
      type: DataTypes.UUID,
      allowNull: false,
    },
    farmName: { type: DataTypes.STRING },
    location: { type: DataTypes.STRING },
    bio: { type: DataTypes.TEXT },
    coverPhoto: { type: DataTypes.STRING },

    // Payout account info
    accountName: { type: DataTypes.STRING, allowNull: true },
    mobileMoneyNumber: { type: DataTypes.STRING, allowNull: true },
    mobileMoneyProvider: { type: DataTypes.STRING, allowNull: true },
  },
  {
    tableName: 'farmer_profile',
    timestamps: true,
    createdAt: 'created_at',
    updatedAt: 'updated_at',
  });

  FarmerProfile.associate = (models) => {
    FarmerProfile.belongsTo(models.User, { foreignKey: "userId", as: "user" });
  };

  return FarmerProfile;
};
