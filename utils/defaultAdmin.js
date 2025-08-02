const bcrypt = require("bcrypt"); // make sure bcrypt is imported
const User = require("../models/login/user");

async function createDefaultAdmin() {
  const adminUser = await User.findOne({ role: "admin" });
  if (!adminUser) {
    const hashedPassword = await bcrypt.hash("archiveAdmin@2025", 10);
    const defaultAdmin = new User({
      username: "adminForArchive",
      password: hashedPassword,
      role: "admin",
    });
    await defaultAdmin.save();
    console.log("Default admin user created.");
  } else {
    console.log("Admin user already exists.");
  }
}
module.exports = createDefaultAdmin;