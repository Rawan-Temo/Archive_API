const mongoose = require("mongoose");

const DB = `${process.env.DB}`;
const DB_USER = process.env.DB_USER;
const DB_PASS = process.env.DB_PASS;

module.exports = async function connection() {
  try {
    await mongoose.connect(DB);
    console.log("DB CONECTION");
  } catch (error) {
    console.log(error);
  }
};
