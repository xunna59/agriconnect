// models/Category.js
const { Sequelize, DataTypes } = require('sequelize');

module.exports = (sequelize) => {
  const Category = sequelize.define("Category", {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true,
    },
    name: {
      type: DataTypes.STRING,
      allowNull: false,
    },
  },
  {
    tableName: 'categories',
    timestamps: true,
    createdAt: 'created_at',
    updatedAt: 'updated_at',
  });

  Category.associate = (models) => {
    Category.hasMany(models.Product, { foreignKey: "categoryId", as: "products" });
  };

  return Category;
};
