const mongoose = require("mongoose");

const coordinatesSchema = new mongoose.Schema(
  {
    coordinates: {
      type: String,
      required: true,
      trim: true,
    },
    note: {
      type: String,
    },
    active: {
      type: Boolean,
      default: true,
    },
  },
  {
    timestamps: true,
  }
);
coordinatesSchema.index(
  { coordinates: 1 },
  { unique: true, partialFilterExpression: { active: true } }
);

const Coordinates = mongoose.model("Coordinates", coordinatesSchema);

module.exports = Coordinates;
