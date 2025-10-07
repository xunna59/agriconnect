// models/Order.js
const { Sequelize, DataTypes } = require('sequelize');

module.exports = (sequelize) => {
  const Order = sequelize.define("Order", {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true,
    },
    buyerId: {
      type: DataTypes.UUID,
      allowNull: false,
    },
    productId: {
      type: DataTypes.UUID,
      allowNull: false,
    },
    quantity: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    totalAmount: {
      type: DataTypes.FLOAT,
      allowNull: false,
    },
    status: {
      type: DataTypes.ENUM("pending", "in_escrow", "completed", "cancelled"),
      defaultValue: "pending",
    },
  },
  {
    tableName: 'orders',
    timestamps: true,
    createdAt: 'created_at',
    updatedAt: 'updated_at',
  });

  Order.associate = (models) => {
    Order.belongsTo(models.User, { foreignKey: "buyerId", as: "buyer" });
    Order.belongsTo(models.Product, { foreignKey: "productId", as: "product" });
  };

  return Order;
};
