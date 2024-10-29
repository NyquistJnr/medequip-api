require("dotenv").config();
import pg from "pg";
const { Sequelize } = require("sequelize");

const sequelize = new Sequelize(process.env.DATABASE_URL, {
  dialect: "postgres",
  dialectModule: pg,
});

module.exports = sequelize;
