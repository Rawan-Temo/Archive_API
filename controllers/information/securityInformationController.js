const SecurityInformation = require("../../models/information/securityInformation");
const Audio = require("../../models/media/audio");
const Document = require("../../models/media/document");
const Image = require("../../models/media/image");
const Video = require("../../models/media/video");
const APIFeatures = require("../../utils/apiFeatures");

// Get all information
const allInformation = async (req, res) => {
  try {
    const features = new APIFeatures(
      SecurityInformation.find().populate([
        { path: "sectionId", select: "name" }, // Only include `name` from Section
        { path: "cityId", select: "name" },
        { path: "countryId", select: "name" },
        { path: "governmentId", select: "name" },
        { path: "regionId", select: "name" },
        { path: "streetId", select: "name" },
        { path: "villageId", select: "name" },
        { path: "events", select: "name" }, // Only include specific fields
        { path: "parties", select: "name" },
        { path: "sources", select: "source_name" },

        { path: "people", select: "firstName surName" },
      ]),
      req.query
    )
      .filter()
      .sort()
      .limitFields()
      .paginate();

    const queryObj = { ...req.query };
    const excludedFields = ["page", "sort", "limit", "fields"];
    excludedFields.forEach((el) => delete queryObj[el]);

    let queryStr = JSON.stringify(queryObj);
    queryStr = queryStr.replace(/\b(gte|gt|lte|lt)\b/g, (match) => `$${match}`);
    const parsedQuery = JSON.parse(queryStr);

    const [informations, numberOfActiveInformations] = await Promise.all([
      features.query,
      SecurityInformation.countDocuments(parsedQuery),
    ]);
    res.status(200).json({
      status: "success",
      results: informations.length,
      numberOfActiveInformations,
      informations,
    });
  } catch (error) {
    res.status(500).json({
      error: error.message,
    });
  }
};

// Create a new information
const createInformation = async (req, res) => {
  try {
    const newInformation = await SecurityInformation.create(req.body);
    res.status(201).json({
      status: "success",
      data: newInformation,
    });
  } catch (error) {
    res.status(400).json({
      status: "fail",
      message: error.message,
    });
  }
};

// Get an information by ID
const getInformationById = async (req, res) => {
  try {
    // Fetch the main information document by ID
    const information = await SecurityInformation.findById(
      req.params.id
    ).populate([
      { path: "sectionId", select: "name" }, // Only include `name` from Section
      { path: "cityId", select: "name" },
      { path: "countryId", select: "name" },
      { path: "governmentId", select: "name" },
      { path: "regionId", select: "name" },
      { path: "streetId", select: "name" },
      { path: "villageId", select: "name" },
      { path: "events", select: "name" }, // Only include specific fields
      { path: "parties", select: "name" },
      { path: "sources", select: "source_name" },

      { path: "people", select: "firstName lastName" },
    ]);

    if (!information) {
      return res.status(404).json({ message: "Information not found" });
    }

    // Fetch related media for the information
    const [images, videos, documents, audios] = await Promise.all([
      Image.find({ informationId: information._id }), // Fetch related images
      Video.find({ informationId: information._id }), // Fetch related videos
      Document.find({ informationId: information._id }), // Fetch related documents
      Audio.find({ informationId: information._id }), // Fetch related audios
    ]);

    // Add media to the information object
    const informationWithMedia = {
      ...information.toObject(),
      media: {
        images: images.map((image) => image.src),
        videos: videos.map((video) => video.src),
        documents: documents.map((doc) => doc.src),
        audios: audios.map((audio) => audio.src),
      },
    };

    res.status(200).json({
      status: "success",
      data: informationWithMedia,
    });
  } catch (error) {
    res.status(500).json({
      status: "fail",
      message: error.message,
    });
  }
};

// Update an information by ID
const updateInformation = async (req, res) => {
  try {
    const updatedInformation = await SecurityInformation.findByIdAndUpdate(
      req.params.id,
      req.body,
      {
        new: true, // Return the updated document
        runValidators: true, // Enforce schema validators
      }
    );

    if (!updatedInformation) {
      return res.status(404).json({ message: "Information not found" });
    }

    res.status(200).json({
      status: "success",
      data: updatedInformation,
    });
  } catch (error) {
    res.status(500).json({
      status: "fail",
      message: error.message,
    });
  }
};

// Deactivate an information by ID
const deactivateInformation = async (req, res) => {
  try {
    const deactivatedInformation = await SecurityInformation.findByIdAndUpdate(
      req.params.id,
      { active: false },
      { new: true, runValidators: true }
    );

    if (!deactivatedInformation) {
      return res.status(404).json({ message: "Information not found" });
    }

    res.status(200).json({
      status: "success",
      message: "Information deactivated successfully",
      data: deactivatedInformation,
    });
  } catch (error) {
    res.status(500).json({
      status: "fail",
      message: error.message,
    });
  }
};

module.exports = {
  allInformation,
  createInformation,
  getInformationById,
  updateInformation,
  deactivateInformation,
};
