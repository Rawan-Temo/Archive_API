const Information = require("../../models/information/information");
const Audio = require("../../models/media/audio");
const Document = require("../../models/media/document");
const Image = require("../../models/media/image");
const Video = require("../../models/media/video");
const APIFeatures = require("../../utils/apiFeatures");
const { ObjectId } = require("mongoose").Types;
const { search } = require("../../utils/serach");

// Get all information
const allInformation = async (req, res) => {
  if (req.query.search) {
    await search(
      Information,
      ["subject"],
      [
        { path: "sectionId", select: "name" }, // Only include `name` from Section
        { path: "cityId", select: "name" },
        { path: "countryId", select: "name" },
        { path: "governorateId", select: "name" },
        { path: "countyId", select: "name" },
        { path: "regionId", select: "name" },
        { path: "streetId", select: "name" },
        { path: "villageId", select: "name" },
        { path: "events", select: "name" }, // Only include specific fields
        { path: "parties", select: "name" },
        { path: "sources", select: "source_name" },
        { path: "people", select: "firstName surName" },
        { path: "coordinates", select: "coordinates note" },
      ],
      req,
      res
    );
    return;
  }
  try {
    const role = req.user.role;
    const sectionId = new ObjectId(req.user.sectionId);
    let features;
    if (role === "user") {
      features = new APIFeatures(
        Information.find({ sectionId })
          .populate([
            { path: "sectionId", select: "name" }, // Only include `name` from Section
            { path: "cityId", select: "name" },
            { path: "countryId", select: "name" },
            { path: "governorateId", select: "name" },
            { path: "countyId", select: "name" },
            { path: "regionId", select: "name" },
            { path: "streetId", select: "name" },
            { path: "villageId", select: "name" },
            { path: "events", select: "name" }, // Only include specific fields
            { path: "parties", select: "name" },
            { path: "sources", select: "source_name" },
            { path: "coordinates", select: "coordinates note" },
            { path: "people", select: "firstName surName image" },
          ])
          .lean(),
        req.query
      )
        .filter()
        .sort()
        .limitFields()
        .paginate();
    } else {
      features = new APIFeatures(
        Information.find()
          .populate([
            { path: "sectionId", select: "name" }, // Only include `name` from Section
            { path: "cityId", select: "name" },
            { path: "countryId", select: "name" },
            { path: "governorateId", select: "name" },
            { path: "countyId", select: "name" },
            { path: "regionId", select: "name" },
            { path: "streetId", select: "name" },
            { path: "villageId", select: "name" },
            { path: "events", select: "name" }, // Only include specific fields
            { path: "parties", select: "name" },
            { path: "sources", select: "source_name" },
            { path: "coordinates", select: "coordinates note" },
            { path: "people", select: "firstName surName image" },
          ])
          .lean(),
        req.query
      )
        .filter()
        .sort()
        .limitFields()
        .paginate();
    }

    const queryObj = { ...req.query };
    const excludedFields = ["page", "sort", "limit", "fields"];
    excludedFields.forEach((el) => delete queryObj[el]);

    let queryStr = JSON.stringify(queryObj);
    queryStr = queryStr.replace(/\b(gte|gt|lte|lt)\b/g, (match) => `$${match}`);
    const parsedQuery = JSON.parse(queryStr);
    if (role === "user") {
      parsedQuery.sectionId = sectionId;
    }
    const [informations, numberOfActiveInformations] = await Promise.all([
      features.query,
      Information.countDocuments(parsedQuery),
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
    const role = req.user.role;
    const sectionId = new ObjectId(req.user.sectionId);

    // If the user is a regular user, add the sectionId to the request body
    if (role === "user") {
      req.body.sectionId = sectionId;
    }

    const newInformation = await Information.create(req.body);
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
    const role = req.user.role;
    let information;
    if (role === "user") {
      information = await Information.findOne({
        _id: req.params.id,
        sectionId: req.user.sectionId,
        active: true, // Ensure only active information is returned
      })
        .populate([
          { path: "sectionId", select: "name" },
          { path: "cityId", select: "name" },
          { path: "countryId", select: "name" },
          { path: "governorateId", select: "name" },
          { path: "countyId", select: "name" },
          { path: "regionId", select: "name" },
          { path: "streetId", select: "name" },
          { path: "villageId", select: "name" },
          { path: "events", select: "name" },
          { path: "parties", select: "name" },
          { path: "sources", select: "source_name" },
          { path: "coordinates", select: "coordinates note" },
          { path: "people", select: "firstName surName image fatherName" },
        ])
        .lean();
      // Fetch the main information document by ID with populated fields
    } else {
      // Fetch the main information document by ID with populated fields
      information = await Information.findOne({
        _id: req.params.id,
        active: true, // Ensure only active information is returned
      })
        .populate([
          { path: "sectionId", select: "name" },
          { path: "cityId", select: "name" },
          { path: "countryId", select: "name" },
          { path: "governorateId", select: "name" },
          { path: "countyId", select: "name" },
          { path: "regionId", select: "name" },
          { path: "streetId", select: "name" },
          { path: "villageId", select: "name" },
          { path: "events", select: "name" },
          { path: "parties", select: "name" },
          { path: "sources", select: "source_name" },
          { path: "coordinates", select: "coordinates note" },
          { path: "people", select: "firstName surName image fatherName" },
        ])
        .lean();
    }

    if (!information) {
      return res.status(404).json({ message: "Information not found" });
    }

    // Fetch related media for the information
    const mediaTypes = [Image, Video, Document, Audio];
    const mediaPromises = mediaTypes.map((Model) =>
      Model.find({ informationId: information._id })
    );
    const [images, videos, documents, audios] = await Promise.all(
      mediaPromises
    );

    // Add media to the information object
    const informationWithMedia = {
      ...information.toObject(),
      media: {
        images: images.map((image) => ({
          _id: image._id,
          src: image.src,
        })),
        videos: videos.map((video) => ({
          _id: video._id,
          src: video.src,
        })),
        documents: documents.map((doc) => ({
          _id: doc._id,
          src: doc.src,
        })),
        audios: audios.map((audio) => ({
          _id: audio._id,
          src: audio.src,
        })),
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
    const role = req.user.role;
    const sectionId = new ObjectId(req.user.sectionId);
    const query = { _id: req.params.id };

    // If the user is a regular user, ensure the sectionId matches
    if (role === "user") {
      req.body.sectionId = sectionId;
      query.sectionId = sectionId;
    }

    const updatedInformation = await Information.findOneAndUpdate(
      query,
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
    const role = req.user.role;
    const sectionId = new ObjectId(req.user.sectionId);

    // If the user is a regular user, ensure the sectionId matches
    const query = { _id: req.params.id };
    if (role === "user") {
      query.sectionId = sectionId;
    }

    const deactivatedInformation = await Information.findOneAndUpdate(
      query,
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
