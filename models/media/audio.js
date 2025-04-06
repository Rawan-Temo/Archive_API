const mongoose = require("mongoose");

const audioSchema = new mongoose.Schema(
  {
    informationId: {
      type: mongoose.Schema.Types.ObjectId, // References the News model
      ref: "SecurityInformation", // Name of the related collection (News)
      required: true,
    },
    src: {
      type: String, // Path or URL to the Audio
      required: true,
    },
  },
  { timestamps: true }
); // Add createdAt and updatedAt timestamps automatically

// Export the model
audioSchema.index({ informationId: 1, src: 1 });
const Audio = mongoose.model("Audio", audioSchema);
module.exports = Audio;
 