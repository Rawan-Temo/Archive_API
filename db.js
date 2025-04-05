const mongoose = require("mongoose");

const DB = `${process.env.DB}/${process.env.DB_NAME}`;

module.exports = async function connection() {
  try {
    await mongoose.connect(DB);
    console.log("DB CONECTION");
  } catch (error) {
    console.log(error);
  }
};
