const mongoose = require("mongoose");

const streetSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, "A street must have a name"],
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

// Partial Index: Unique name for active streets only
streetSchema.index(
  { name: 1 },
  { unique: true, partialFilterExpression: { active: true } }
);

const Street = mongoose.model("Street", streetSchema);

module.exports = Street;
