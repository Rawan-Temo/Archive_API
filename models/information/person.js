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
    },
    placeOfBirth: {
      type: String,
    },
    maritalStatus: {
      type: String,
      enum: ["Married", "Single", "Other"],
    },
    occupation: {
      type: String,
    },
    gender: {
      type: String,
      enum: ["Male", "Female"],
    },
    image: {
      type: String,
    },
    cityId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "City",
    },
    countryId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Country",
    },
    governmentId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Government",
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

    active: {
      type: Boolean,
      default: true,
    },
  },
  {
    timestamps: true,
  }
);

const Person = mongoose.model("Person", personSchema);

module.exports = Person;
