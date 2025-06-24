const mongoose = require("mongoose");

const countySchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, "A county entity must have a name"],
      trim: true,
    },
    country: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Country",
      required: [true, "A county must belong to a country"],
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

countySchema.index(
  { name: 1 },
  { unique: true, partialFilterExpression: { active: true } }
);

const County = mongoose.model("County", countySchema);
module.exports = County;
