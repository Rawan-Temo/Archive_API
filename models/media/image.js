const mongoose = require("mongoose");

const imageSchema = new mongoose.Schema(
  {
    parentModel: {
      type: String,
      required: true,
      enum: ["SecurityInformation", "Report", "Result"], // List all possible parent models
    },
    parentId: {
      type: mongoose.Schema.Types.ObjectId,
      required: true,
      refPath: "parentModel", // Dynamic reference based on parentModel
    },
    src: {
      type: String,
      required: true,
    },
  },
  { timestamps: true }
);

// Optional: indexing for performance

const Image = mongoose.model("Image", imageSchema);
module.exports = Image;
