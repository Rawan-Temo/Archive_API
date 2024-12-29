const mongoose = require("mongoose");

const sectionSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      trim: true,
    },
    active: {
      type: Boolean,
      default: true, // Default is active
    },
  },
  {
    timestamps: true, // Automatically add createdAt and updatedAt
  }
);
sectionSchema.index(
  { name: 1 },
  { unique: true, partialFilterExpression: { active: true } }
);
// Create the model based on the schema
const Section = mongoose.model("Section", sectionSchema);

module.exports = Section;
