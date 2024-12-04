const mongoose = require("mongoose");

const villageSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, "A village must have a name"],
      trim: true,
    },
    city: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "City",
      required: true,
    },
    active: {
      type: Boolean,
      default: true, // Default is active
    },
  },
  {
    timestamps: true, // Automatically adds `createdAt` and `updatedAt` fields
  }
);

// Partial Index: Unique name for active villages only
villageSchema.index(
  { name: 1 },
  { unique: true, partialFilterExpression: { active: true } }
);

const Village = mongoose.model("Village", villageSchema);

module.exports = Village;
