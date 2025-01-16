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
    sectionId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Section",
      required: true,
    },
    cityId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "City",
      required: true,
    },
    countryId: {
      type: mongoose.Schema.Types.ObjectId,
      required: true,
      ref: "Country",
    },
    governmentId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Government",
      required: true,
    },
    regionId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Region",
    },
    streetId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Street",
    },
    villageId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Village",
    },
    sources: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Source",
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

coordinatesSchema.index(
  { coordinates: 1 },
  { unique: true, partialFilterExpression: { active: true } }
);
coordinatesSchema.pre("save", function (next) {
  this.coordinates = this.coordinates.replace(/\s+/g, "");
  next();
});

const Coordinates = mongoose.model("Coordinates", coordinatesSchema);

module.exports = Coordinates;
