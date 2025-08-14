const mongoose = require("mongoose");

const departmentSchema = new mongoose.Schema(
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
departmentSchema.index(
  { name: 1 },
  { unique: true, partialFilterExpression: { active: true } }
);
// Create the model based on the schema
const Department = mongoose.model("Department", departmentSchema);

module.exports = Department;
