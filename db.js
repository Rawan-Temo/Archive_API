const mongoose = require("mongoose");
const createDefaultAdmin = require("./utils/defaultAdmin");

const DB = `${process.env.DB}/${process.env.DB_NAME}?authSource=admin`;

module.exports = async function connection() {
  try {
    await mongoose.connect(DB, {
      user: process.env.DB_USER,
      pass: process.env.DB_PASS,
    });
    console.log("DB CONECTION");
    await createDefaultAdmin();

    console.log("DB CONNECTION SUCCESSFUL");
  } catch (error) {
    console.error("DB Connection Failed:", error);
  }
};
