// models/equipment.model.js

const { DataTypes } = require("sequelize");
const sequelize = require("../config/db.config");
const User = require("./user.model"); // Import User model

const Equipment = sequelize.define("Equipment", {
  id: {
    type: DataTypes.INTEGER,
    autoIncrement: true,
    primaryKey: true,
  },
  name: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  description: {
    type: DataTypes.TEXT,
    allowNull: false,
  },
  category: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  images: {
    type: DataTypes.ARRAY(DataTypes.STRING), // Store an array of image URLs
    allowNull: true,
  },
  tags: {
    type: DataTypes.ARRAY(DataTypes.STRING),
    allowNull: true,
  },
  popularity: {
    type: DataTypes.INTEGER,
    default: 0,
    allowNull: false,
  },
  useCases: {
    type: DataTypes.TEXT,
    allowNull: false,
  },
  userId: {
    type: DataTypes.INTEGER,
    references: {
      model: User,
      key: "id",
    },
    allowNull: false,
  },
});

// Associate the Equipment model with the User model
Equipment.belongsTo(User, { foreignKey: "userId" });

module.exports = Equipment;
