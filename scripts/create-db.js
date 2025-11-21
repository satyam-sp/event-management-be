const { Sequelize } = require("sequelize");
require("dotenv").config({ path: `.env.${process.env.NODE_ENV || "development"}` });

async function createDB() {
  try {
    const sequelize = new Sequelize(
      "postgres",                     // default DB
      process.env.DB_USERNAME,
      process.env.DB_PASSWORD,
      {
        host: process.env.DB_HOST,
        port: process.env.DB_PORT,
        dialect: "postgres",
      }
    );

    // Create database with correct name
    await sequelize.query(`CREATE DATABASE "${process.env.DB_NAME}";`);
    console.log(`✅ Database "${process.env.DB_NAME}" created successfully.`);
    process.exit(0);
  } catch (err) {
    if (err.original && err.original.code === "42P04") {
      console.log(`⚠️ Database "${process.env.DB_NAME}" already exists.`);
      process.exit(0);
    }
    console.error("❌ Error creating database:", err);
    process.exit(1);
  }
}

createDB();
