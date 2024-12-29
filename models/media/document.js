const mongoose = require("mongoose");

const documentSchema = new mongoose.Schema(
  {
    informationId: {
      type: mongoose.Schema.Types.ObjectId, // References the News model
      ref: "News", // Name of the related collection (News)
      required: true,
    },
    src: {
      type: String, // Path or URL to the Document
      required: true,
    },
  },
  { timestamps: true }
); // Add createdAt and updatedAt timestamps automatically

// Export the model
documentSchema.index({ informationId: 1, src: 1 });
const Document = mongoose.model("Document", documentSchema);
module.exports = Document;
 