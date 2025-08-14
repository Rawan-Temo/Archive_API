const mongoose = require("mongoose");

const recipientSchema = new mongoose.Schema(
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
recipientSchema.index(
  { name: 1 },
  { unique: true, partialFilterExpression: { active: true } }
);
// Create the model based on the schema
const Recipient = mongoose.model("Recipient", recipientSchema);

module.exports = Recipient;
