const mongoose = require("mongoose");

const DB = `${process.env.DB}/${process.env.DB_NAME}`;
const DB_NAME = process.env.DB_NAME;
const DB_USER = process.env.DB_USER || "adminUser";
const DB_PASS = process.env.DB_PASS || "adminPass123";

module.exports = async function connection() {
  try {
    // Step 1: Connect to target DB to create user if not exists
    const targetConn = await mongoose
      .createConnection(`mongodb://localhost:27017/${DB_NAME}`)
      .asPromise();

    const users = await targetConn.db.command({ usersInfo: DB_USER });

    if (users.users.length === 0) {
      await targetConn.db.command({
        createUser: DB_USER,
        pwd: DB_PASS,
        roles: [{ role: "readWrite", db: DB_NAME }],
      });
      console.log(`MongoDB User "${DB_USER}" created for DB "${DB_NAME}".`);
    } else {
      console.log(
        `MongoDB User "${DB_USER}" already exists. Updating password...`
      );
      await targetConn.db.command({
        updateUser: DB_USER,
        pwd: DB_PASS,
      });
      console.log(`MongoDB User "${DB_USER}" password updated.`);
    }
    await targetConn.close();

    console.log("Target DB user setup successful.");
    // Step 2: Connect to App DB using the new user
    const appConnStr = `mongodb://${DB_USER}:${DB_PASS}@localhost:27017/${DB_NAME}?authSource=${DB_NAME}`;
    await mongoose.connect(appConnStr);

    // Step 3: Create Default Admin in your collection if not exists
    const createDefaultAdmin = require("./utils/defaultAdmin");
    await createDefaultAdmin();

    console.log("DB CONNECTION SUCCESSFUL");
  } catch (error) {
    console.error("DB Connection Failed:", error);
  }
};
