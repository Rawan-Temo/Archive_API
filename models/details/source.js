const mongoose = require("mongoose");

const sourceSchema = new mongoose.Schema(
  {
    field: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Field",
      required: [true, "A source must belong to a Field"],
    },
    source_name: {
      type: String,
      required: [true, "Source must have a name"],
      trim: true,
    },
    source_credibility: {
      type: String,
      required: [true, "Source must have a credibility rating"],
      enum: ["High", "Medium", "Low"],
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
sourceSchema.index(
  { source_name: 1, field: 1 },
  { unique: true, partialFilterExpression: { active: true } }
);

const Source = mongoose.model("Source", sourceSchema);

module.exports = Source;
