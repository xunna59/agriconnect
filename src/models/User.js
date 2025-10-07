// models/User.js
const { Sequelize, DataTypes } = require('sequelize');

module.exports = (sequelize) => {
  const User = sequelize.define("User", {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true,
    },
    fullname: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    email: {
      type: DataTypes.STRING,
      allowNull: false,
      unique: true,
    },
    phone: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    password: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    role: {
      type: DataTypes.ENUM("farmer", "buyer", "admin"),
      allowNull: false,
      defaultValue: "buyer",
    },
     walletBalance: { 
      type: DataTypes.FLOAT,
      defaultValue: 0.0,
    },
  },
  {
    tableName: 'users',
    timestamps: true,
    createdAt: 'created_at',
    updatedAt: 'updated_at',
  });

  User.associate = (models) => {
    User.hasOne(models.FarmerProfile, { foreignKey: "userId", as: "farmerProfile" });
    User.hasMany(models.Order, { foreignKey: "buyerId", as: "orders" });
    User.hasMany(models.Product, { foreignKey: "farmerId", as: "products" });
  };

  return User;
};
