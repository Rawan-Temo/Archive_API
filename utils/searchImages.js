const multer = require("multer");
const path = require("path");
const axios = require("axios");
const FormData = require("form-data");
const Image = require("../models/media/image");
const Person = require("../models/information/person");

const storage = multer.memoryStorage(); // Store in memory for direct API call
const upload = multer({ storage });

const searchImages = async (req, res) => {
  if (!req.file) {
    return res.status(400).json({ error: "No image file uploaded" });
  }

  try {
    const formData = new FormData();
    formData.append("image", req.file.buffer, {
      filename: req.file.originalname,
      contentType: req.file.mimetype,
    });

    // Call your Python API for image search
    const response = await axios.post(
      "http://localhost:5000/search-image/",
      formData,
      {
        headers: {
          ...formData.getHeaders(),
        },
      }
    );

    const matches = response.data.matches; // Assuming this is the array of matching images

    if (matches.length === 0) {
      return res.status(404).json({ error: "No matching images found" });
    }

    const results = [];

    // Iterate over matches and query the respective table
    for (const match of matches) {
      let tableResult;

      if (match.folder === "other") {
        // Query the 'Image' table for the 'other' folder
        tableResult = await Image.findOne({ src: match.image });
      } else if (match.folder === "profileImages") {
        // Query the 'Person' table for the 'profileImages' folder
        tableResult = await Person.findOne({ image: match.image });
      }

      // If the item exists in the respective table, append it to results
      if (tableResult) {
        results.push({
          similarity: match.similarity,
          tableData: tableResult, // Include the data from the respective table
        });
      }
    }

    return res.json(results);
  } catch (error) {
    console.error(
      "Error calling Python API:",
      error.response?.data || error.message
    );
    return res.status(500).json({ error: "Internal Server Error" });
  }
};

module.exports = { upload, searchImages };
