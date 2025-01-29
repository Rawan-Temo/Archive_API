const mongoose = require("mongoose");
const backupSchema = new mongoose.Schema(
  {
    root: {
      type: String,
      unique: true,
    },
  },
  {
    timestamps: true,
  }
);

const Backup = mongoose.model("Backup", backupSchema);
module.exports = Backup;
