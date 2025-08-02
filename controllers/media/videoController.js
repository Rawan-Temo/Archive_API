const APIFeatures = require("../../utils/apiFeatures");
const multer = require("multer");
const path = require("path");
const fs = require("fs");
const Video = require("../../models/media/video"); // Assuming you have a `video` model similar to the `image` model
//----------------------------------------------------------------
//----------------------------------------------------------------
// Video Handling
//----------------------------------------------------------------
//----------------------------------------------------------------

// Get all videos
const allVideos = async (req, res) => {
  try {
    // Create a filtered query object for counting active videos
    const queryObj = { ...req.query };
    const excludedFields = ["page", "sort", "limit", "fields"];
    excludedFields.forEach((el) => delete queryObj[el]);

    // Parse the query string to convert operators like gte/gt/lte/lt into MongoDB equivalents
    let queryStr = JSON.stringify(queryObj);
    queryStr = queryStr.replace(/\b(gte|gt|lte|lt)\b/g, (match) => `$${match}`);
    const parsedQuery = JSON.parse(queryStr);

    // Apply the parsed filter for querying and counting
    const features = new APIFeatures(
      Video.find().populate("parentId"),
      req.query
    )
      .filter()
      .sort()
      .limitFields()
      .paginate();
    const [videosList, totalVideosCount] = await Promise.all([
      features.query, // Get paginated videos results
      Video.countDocuments(parsedQuery), // Count total matching documents
    ]);

    res.status(200).json({
      status: "success",
      results: videosList.length, // Number of results in this response
      totalVideosCount, // Total count of matching documents
      data: videosList, // The videos data
    });
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

// Multer configuration for video uploads
const videoStorage = multer.diskStorage({
  destination: (req, file, cb) => {
    const uploadPath = path.join(__dirname, "..", "..", "public", "videos"); // Change to "videos" folder
    cb(null, uploadPath); // Correct path to save videos
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1e9);
    cb(null, `${uniqueSuffix}-${file.originalname}`);
  },
});

const videoFileFilter = (req, file, cb) => {
  const validMimeTypes = ["video/mp4", "video/mkv", "video/avi", "video/webm"]; // Specify allowed video types
  if (validMimeTypes.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(new Error("Only video files are allowed!"), false);
  }
};

const videoUploads = multer({
  storage: videoStorage,
  fileFilter: videoFileFilter,
  limits: {
    fileSize: 2048 * 1024 * 1024, // 100MB per video file
  },
});

const uploadVideos = videoUploads.array("videos", 10); // Allow up to 10 videos

// Function to handle video uploads and save them to the database
const handleVideos = async (req, res) => {
  try {
    const { parentId, parentModel } = req.body; // Extract the informationId from the request body

    if (!parentId) {
      return res.status(400).json({ error: "parentId is required" });
    }

    if (!req.files || req.files.length === 0) {
      return res.status(400).json({ error: "No videos uploaded" });
    }

    const videoRecords = [];

    // Loop through the uploaded files and save them to the database
    for (const file of req.files) {
      const videoSrc = `/videos/${file.filename}`;
      const newVideo = new Video({
        parentId,
        parentModel,
        src: videoSrc,
      });

      const savedVideo = await newVideo.save();
      videoRecords.push(savedVideo);
    }

    res.status(200).json({
      message: "Videos uploaded and saved successfully!",
      videos: videoRecords,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: error.message });
  }
};

// Delete videos
const deleteVideos = async (req, res) => {
  try {
    const { ids } = req.body; // Assuming you pass an array of video IDs to delete

    if (!ids || ids.length === 0) {
      return res
        .status(400)
        .json({ error: "No video IDs provided for deletion" });
    }

    // Find videos by their IDs
    const videosToDelete = await Video.find({ _id: { $in: ids } });

    if (videosToDelete.length === 0) {
      return res.status(404).json({ error: "No videos found to delete" });
    }

    // Delete each video file from the file system
    for (const video of videosToDelete) {
      const videoPath = path.join(__dirname, "..", "..", "public", video.src); // Path to the video file
      if (fs.existsSync(videoPath)) {
        fs.unlinkSync(videoPath); // Delete the video file from the server
      }
    }

    // Delete the videos from the database
    await Video.deleteMany({ _id: { $in: ids } });

    res.status(200).json({
      message:
        "Videos deleted successfully from both database and file system.",
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: error.message });
  }
};

// Update video
const updateVideo = async (req, res) => {
  try {
    const { id } = req.params; // The ID of the video to update

    // Find the existing video document in the database
    const existingVideo = await Video.findById(id);

    if (!existingVideo) {
      return res.status(404).json({ error: "Video not found" });
    }

    // Determine the new video path (if any)
    const newVideoPath = req.files[0]
      ? `/videos/${req.files[0].filename}` // New video path
      : existingVideo.src; // If no new video, keep the old one

    // If an old video exists and a new one is uploaded, delete the old one
    if (existingVideo.src && req.files[0]) {
      const oldVideoPath = path.join(
        __dirname,
        "..",
        "..",
        "public",
        existingVideo.src
      ); // Absolute path to the old video
      if (fs.existsSync(oldVideoPath)) {
        fs.unlinkSync(oldVideoPath); // Delete old video file
      }
    }

    // Update the video document in the database
    const updatedVideo = await Video.findByIdAndUpdate(
      id,
      { src: newVideoPath }, // Update the video path
      { new: true, runValidators: true } // Return the updated document and validate
    );

    // Return a success response with the updated video
    res.status(200).json({
      message: "Video updated successfully",
      updatedVideo,
    });
  } catch (error) {
    console.error(error);
    res.status(400).json({ message: error.message });
  }
};

module.exports = {
  handleVideos,
  allVideos,
  uploadVideos,
  deleteVideos,
  updateVideo,
};
