const mongoose = require("mongoose");

const SecurityInformationSchema = new mongoose.Schema(
  {
    subject: {
      type: String,
      required: true,
    },
    note: {
      type: String,
      required: true,
    },
    detiles: {
      type: String,
      required: true,
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
    addressDetails: {
      type: String, // Optional field for additional address details
    },
    events: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Event",
      },
    ],
    parties: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Party",
      },
    ],
    sources: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Source",
      },
    ],
    people: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Person",
      },
    ],
    Coordinates: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Coordinates",
      },
    ],
    active: {
      type: Boolean,
      default: true,
    },
  },
  {
    timestamps: true,
  }
);
SecurityInformationSchema.index({
  subject: 1,
  note: 1,
  detiles: 1,
});
const SecurityInformation = mongoose.model(
  "SecurityInformation",
  SecurityInformationSchema
);

module.exports = SecurityInformation;
