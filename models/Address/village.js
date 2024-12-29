const mongoose = require("mongoose");

const villageSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, "A village must have a name"],
      trim: true,
    },
    city: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "City",
      required: true,
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

villageSchema.index(
  { name: 1 },
  { unique: true, partialFilterExpression: { active: true } }
);

const Village = mongoose.model("Village", villageSchema);

module.exports = Village;
