const mongoose = require("mongoose");
const createDefaultAdmin = require("./utils/defaultAdmin");

const DB = `${process.env.DB}/${process.env.DB_NAME}?authSource=admin`;

module.exports = async function connection() {
  try {
    await mongoose.connect(
      "mongodb+srv://rawantemmo:ZluRtu5Rf2aPLQ7z@cluster0.ovxkm.mongodb.net/"
    );
    console.log("DB CONECTION");
    await createDefaultAdmin();

    console.log("DB CONNECTION SUCCESSFUL");
  } catch (error) {
    console.error("DB Connection Failed:", error);
  }
};
