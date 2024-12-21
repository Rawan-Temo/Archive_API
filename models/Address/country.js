const mongoose = require("mongoose");

const countrySchema = new mongoose.Schema(
  {
    name: {
      type: String,
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
countrySchema.index(
  { name: 1 },
  { unique: true, partialFilterExpression: { active: true } }
);



const Country = mongoose.model("Country", countrySchema);

module.exports = Country;
