const mongoose = require("mongoose");

const partySchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, "Party must have a name"],
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
partySchema.index(
  { name: 1 },
  { unique: true, partialFilterExpression: { active: true } }
);
const Party = mongoose.model("Party", partySchema);

module.exports = Party;
 