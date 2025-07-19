const mongoose = require("mongoose");

const documentSchema = new mongoose.Schema(
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
); // Add createdAt and updatedAt timestamps automatically

// Export the model
const Document = mongoose.model("Document", documentSchema);
module.exports = Document;
