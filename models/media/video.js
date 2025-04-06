const mongoose = require("mongoose");

const videoSchema = new mongoose.Schema(
  {
    informationId: {
      type: mongoose.Schema.Types.ObjectId, // References the News model
      ref: "SecurityInformation", // Name of the related collection (News)
      required: true,
    },
    src: {
      type: String, // Path or URL to the Video
      required: true,
    },
  },
  { timestamps: true }
); // Add createdAt and updatedAt timestamps automatically

// Export the model
videoSchema.index({ informationId: 1, src: 1 });
const Video = mongoose.model("Video", videoSchema);
module.exports = Video;
