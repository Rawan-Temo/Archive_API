const mongoose = require("mongoose");

const governorateSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, "A governorate entity must have a name"],
      trim: true,
    },
    country: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Country",
      required: [true, "A governorate must belong to a country"],
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

governorateSchema.index(
  { name: 1 },
  { unique: true, partialFilterExpression: { active: true } }
);

const Governorate = mongoose.model("Governorate", governorateSchema);
module.exports = Governorate;
