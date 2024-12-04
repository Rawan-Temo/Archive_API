const mongoose = require("mongoose");

const governmentSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, "A government entity must have a name"],
      trim: true,
    },
    country: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Country", // Assuming you have a 'Country' schema
      required: [true, "A government must belong to a country"],
    },
    active: {
      type: Boolean,
      default: true,
    },
  },
  {
    timestamps: true, // Automatically adds `createdAt` and `updatedAt` fields
  }
);

// Middleware to update `updatedAt` before saving
governmentSchema.index(
  { name: 1 },
  { unique: true, partialFilterExpression: { active: true } }
);

const Government = mongoose.model("Government", governmentSchema);

module.exports = Government;
