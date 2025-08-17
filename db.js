const mongoose = require("mongoose");
const createDefaultAdmin = require("./utils/defaultAdmin");

const DB = `${process.env.DB}/${process.env.DB_NAME}?authSource=admin`;

module.exports = async function connection() {
  try {
    await mongoose.connect(DB, {
      pass: process.env.DB_PASS,
      user: process.env.DB_USER,
    });
    console.log("DB CONECTION");
    await createDefaultAdmin();

    console.log("DB CONNECTION SUCCESSFUL");
  } catch (error) {
    console.error("DB Connection Failed:", error);
  }
};
