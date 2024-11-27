const { DataTypes } = require("sequelize");
const sequelize = require("../config/db.config");
const Equipment = require("./equipment.model");
const User = require("./user.model");


const SavedEquipment = sequelize.define("SavedEquipment", {
    id: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true,
    },
    userId: {
      type: DataTypes.INTEGER,
      references: {
        model: User,
        key: "id",
      },
      allowNull: false,
      unique: true
    },
    equipmentIds: {
      type: DataTypes.ARRAY(DataTypes.INTEGER),
      allowNull: true,
    }
  })
  
  User.hasOne(SavedEquipment, { foreignKey: "userId"})
  SavedEquipment.belongsTo(User, { foreignKey: "userId" });

  module.exports = SavedEquipment;