// models/Product.js
const { Sequelize, DataTypes } = require('sequelize');

module.exports = (sequelize) => {
  const Product = sequelize.define("Product", {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true,
    },
    farmerId: {
      type: DataTypes.UUID,
      allowNull: false,
    },
    categoryId: {
      type: DataTypes.UUID,
      allowNull: true,
    },
    name: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    description: DataTypes.TEXT,
    price: {
      type: DataTypes.FLOAT,
      allowNull: false,
    },
    quantityAvailable: {
      type: DataTypes.INTEGER,
      defaultValue: 0,
    },
    images: {
      type: DataTypes.ARRAY(DataTypes.STRING), // ✅ PostgreSQL
      allowNull: true,
      defaultValue: [],
    },
  },
  {
    tableName: 'products',
    timestamps: true,
    createdAt: 'created_at',
    updatedAt: 'updated_at',
  });

  Product.associate = (models) => {
    Product.belongsTo(models.User, { foreignKey: "farmerId", as: "farmer" });
    Product.belongsTo(models.Category, { foreignKey: "categoryId", as: "category" });
    Product.hasMany(models.OrderItem, { foreignKey: "productId", as: "orderItems" });
  };

  return Product;
};
