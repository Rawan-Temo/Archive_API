const mongoose = require("mongoose");

const citySchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, "A city must have a name"],
      trim: true,
    },
    country: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Country",
      required: [true, "A city must belong to a Country"],
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

citySchema.index(
  { name: 1 },
  { unique: true, partialFilterExpression: { active: true } }
);

const City = mongoose.model("City", citySchema);

module.exports = City;
