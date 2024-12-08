const mongoose = require("mongoose");

const regionSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, "A region must have a name"],
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

regionSchema.index(
  { name: 1 },
  { unique: true, partialFilterExpression: { active: true } } 
);

const Region = mongoose.model("Region", regionSchema);

module.exports = Region;
