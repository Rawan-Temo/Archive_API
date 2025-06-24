const mongoose = require("mongoose");

const citySchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, "A city must have a name"],
      trim: true,
    },
    parent: {
      type: String,
      enum: ["County", "Governorate"], // Replace with actual country names
      required: [true, "A county must belong to a country"],
    },
    parentId: {
      type: mongoose.Schema.Types.ObjectId,
      refPath: "parent", // Dynamically reference the model based on the parent field
      required: [true, "A county must have a parent ID"],
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
