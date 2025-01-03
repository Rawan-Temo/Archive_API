const mongoose = require("mongoose");

const personSchema = new mongoose.Schema(
  {
    firstName: {
      type: String,
      required: true,
      trim: true,
    },
    surName: {
      type: String,
      required: true,
      trim: true,
    },
    fatherName: {
      type: String,
      required: true,
      trim: true,
    },
    motherName: {
      type: String,
      required: true,
      trim: true,
    },
    email: {
      type: String,
      lowercase: true,
    },
    phone: {
      type: String,
      required: true,
    },
    birthDate: {
      type: Date,
      required: true,
    },
    placeOfBirth: {
      type: String,
    },
    maritalStatus: {
      type: String,
      required: true,
      enum: ["Married", "Single", "Other"],
    },
    occupation: {
      type: String,
      required: true,
    },
    gender: {
      type: String,
      required: true,
      enum: ["Male", "Female"],
    },
    image: {
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
    addressDetails: {
      type: String, // Optional field for additional address details
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
personSchema.index({
  firstName: 1,
  surName: 1,
  fatherName: 1,
  cityId: 1,
  countryId: 1,
  governmentId: 1,
  regionId: 1,
  streetId: 1,
  villageId: 1,
});
const Person = mongoose.model("Person", personSchema);

module.exports = Person;
