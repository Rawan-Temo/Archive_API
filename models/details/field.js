const mongoose = require("mongoose");

const fieldSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, "Field must have a name"],
      trim: true,
    },
    active: {
      type: Boolean,
      default: true, // Default value is active
    },
  },
  {
    timestamps: true, // Automatically adds createdAt and updatedAt
  }
);
fieldSchema.index(
  { name: 1 },
  { unique: true, partialFilterExpression: { active: true } }
);
// Create the model based on the schema
const Field = mongoose.model("Field", fieldSchema);

module.exports = Field;
