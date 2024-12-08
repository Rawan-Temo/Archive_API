const mongoose = require("mongoose");
const mongooseFuzzySearching = require("mongoose-fuzzy-searching");

const governmentSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, "A government entity must have a name"],
      trim: true,
    },
    country: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Country",
      required: [true, "A government must belong to a country"],
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

governmentSchema.index(
  { name: 1 },
  { unique: true, partialFilterExpression: { active: true } }
);
governmentSchema.plugin(mongooseFuzzySearching, { fields: ["name"] });

const Government = mongoose.model("Government", governmentSchema);

module.exports = Government;
