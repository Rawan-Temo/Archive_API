const mongoose = require("mongoose");

const citySchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, "A city must have a name"],
      trim: true,
    },
    government: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Government", // Reference to the Country schema
      required: [true, "A city must belong to a Government"],
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

// Partial Index: Unique name for active cities only
citySchema.index(
  { name: 1 },
  { unique: true, partialFilterExpression: { active: true } }
);

const City = mongoose.model("City", citySchema);

module.exports = City;
