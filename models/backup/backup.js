const mongoose = require("mongoose");

const backupSchema = new mongoose.Schema(
  {
    root: {
      type: String,
      unique: true,
      required: [true, "Backup root path is required."],
      trim: true,
      match: [
        /^(?:[a-zA-Z]:)?[\\\/]?(?:[\w\s-]+[\\\/]?)*$/,
        "Invalid file path format",
      ],
    },
  },
  {
    timestamps: true, // Adds createdAt & updatedAt timestamps automatically
  }
);

// Ensure root is indexed for fast lookups

const Backup = mongoose.model("Backup", backupSchema);
module.exports = Backup;
