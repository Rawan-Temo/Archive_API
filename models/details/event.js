const mongoose = require("mongoose");

const eventSchema = new mongoose.Schema(
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
eventSchema.index(
  { name: 1 },
  { unique: true, partialFilterExpression: { active: true } }
);
// Create the model based on the schema
const Event = mongoose.model("Event", eventSchema);

module.exports = Event;
