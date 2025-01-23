const APIFeatures = require("../../utils/apiFeatures");
const multer = require("multer");
const path = require("path");
const fs = require("fs");
const Audio = require("../../models/media/audio"); // Assuming you have an `audio` model similar to the `video` model
//----------------------------------------------------------------
//----------------------------------------------------------------
// Audio Handling
//----------------------------------------------------------------
//----------------------------------------------------------------

// Get all audios
const allAudios = async (req, res) => {
  try {
    // Create a filtered query object for counting active audios
    const queryObj = { ...req.query };
    const excludedFields = ["page", "sort", "limit", "fields"];
    excludedFields.forEach((el) => delete queryObj[el]);

    // Parse the query string to convert operators like gte/gt/lte/lt into MongoDB equivalents
    let queryStr = JSON.stringify(queryObj);
    queryStr = queryStr.replace(/\b(gte|gt|lte|lt)\b/g, (match) => `$${match}`);
    const parsedQuery = JSON.parse(queryStr);

    // Apply the parsed filter for querying and counting
    const features = new APIFeatures(Audio.find(), req.query)
      .filter()
      .sort()
      .limitFields()
      .paginate();
    const [audiosList, totalAudiosCount] = await Promise.all([
      features.query, // Get paginated audios results
      Audio.countDocuments(parsedQuery), // Count total matching documents
    ]);

    res.status(200).json({
      status: "success",
      results: audiosList.length, // Number of results in this response
      totalAudiosCount, // Total count of matching documents
      data: audiosList, // The audio data
    });
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

// Multer configuration for audio uploads
const audioStorage = multer.diskStorage({
  destination: (req, file, cb) => {
    const uploadPath = path.join(__dirname, "..", "..", "public", "audios"); // Change to "audios" folder
    cb(null, uploadPath); // Correct path to save audio files
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1e9);
    cb(null, `${uniqueSuffix}-${file.originalname}`);
  },
});

const audioFileFilter = (req, file, cb) => {
  const validMimeTypes = [
    "audio/mpeg", 
    "audio/wav", 
    "audio/ogg", 
    "audio/mp4", 
    "audio/webm",
  ]; // Specify allowed audio types
  if (validMimeTypes.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(new Error("Only audio files are allowed!"), false);
  }
};

const audioUploads = multer({
  storage: audioStorage,
  fileFilter: audioFileFilter,
  limits: {
    fileSize: 50 * 1024 * 1024, // 50MB per audio file
  },
});

const uploadAudios = audioUploads.array("audios", 10); // Allow up to 10 audio files

// Function to handle audio uploads and save them to the database
const handleAudios = async (req, res) => {
  try {
    const { informationId } = req.body; // Extract the informationId from the request body

    if (!informationId) {
      return res.status(400).json({ error: "informationId is required" });
    }

    if (!req.files || req.files.length === 0) {
      return res.status(400).json({ error: "No audio files uploaded" });
    }

    const audioRecords = [];

    // Loop through the uploaded files and save them to the database
    for (const file of req.files) {
      const audioSrc = `/audios/${file.filename}`;
      const newAudio = new Audio({
        informationId,
        src: audioSrc,
      });

      const savedAudio = await newAudio.save();
      audioRecords.push(savedAudio);
    }

    res.status(200).json({
      message: "Audio files uploaded and saved successfully!",
      audios: audioRecords,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: error.message });
  }
};

// Delete audios
const deleteAudios = async (req, res) => {
  try {
    const { ids } = req.body; // Assuming you pass an array of audio IDs to delete

    if (!ids || ids.length === 0) {
      return res.status(400).json({ error: "No audio IDs provided for deletion" });
    }

    // Find audios by their IDs
    const audiosToDelete = await Audio.find({ _id: { $in: ids } });

    if (audiosToDelete.length === 0) {
      return res.status(404).json({ error: "No audios found to delete" });
    }

    // Delete each audio file from the file system
    for (const audio of audiosToDelete) {
      const audioPath = path.join(__dirname, "..", "..", "public", audio.src); // Path to the audio file
      if (fs.existsSync(audioPath)) {
        fs.unlinkSync(audioPath); // Delete the audio file from the server
      }
    }

    // Delete the audios from the database
    await Audio.deleteMany({ _id: { $in: ids } });

    res.status(200).json({
      message: "Audios deleted successfully from both database and file system.",
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: error.message });
  }
};

// Update audio
const updateAudio = async (req, res) => {
  try {
    const { id } = req.params; // The ID of the audio to update

    // Find the existing audio document in the database
    const existingAudio = await Audio.findById(id);

    if (!existingAudio) {
      return res.status(404).json({ error: "Audio not found" });
    }

    // Determine the new audio path (if any)
    const newAudioPath = req.files[0]
      ? `/audios/${req.files[0].filename}` // New audio path
      : existingAudio.src; // If no new audio, keep the old one

    // If an old audio exists and a new one is uploaded, delete the old one
    if (existingAudio.src && req.files[0]) {
      const oldAudioPath = path.join(
        __dirname,
        "..",
        "..",
        "public",
        existingAudio.src
      ); // Absolute path to the old audio
      if (fs.existsSync(oldAudioPath)) {
        fs.unlinkSync(oldAudioPath); // Delete old audio file
      }
    }

    // Update the audio document in the database
    const updatedAudio = await Audio.findByIdAndUpdate(
      id,
      { src: newAudioPath }, // Update the audio path
      { new: true, runValidators: true } // Return the updated document and validate
    );

    // Return a success response with the updated audio
    res.status(200).json({
      message: "Audio updated successfully",
      updatedAudio,
    });
  } catch (error) {
    console.error(error);
    res.status(400).json({ message: error.message });
  }
};

module.exports = {
  handleAudios,
  allAudios,
  uploadAudios,
  deleteAudios,
  updateAudio,
};
