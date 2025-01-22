const Coordinate = require("../../models/information/coordinate");
const APIFeatures = require("../../utils/apiFeatures");

// Get all coordinates
const allCoordinates = async (req, res) => {
  try {
    const queryObj = { ...req.query };
    const excludedFields = ["page", "sort", "limit", "fields"];
    excludedFields.forEach((el) => delete queryObj[el]);

    let queryStr = JSON.stringify(queryObj);
    queryStr = queryStr.replace(/\b(gte|gt|lte|lt)\b/g, (match) => `$${match}`);
    const parsedQuery = JSON.parse(queryStr);

    const features = new APIFeatures(
      Coordinate.find().populate([
        { path: "sectionId", select: "name" },
        { path: "cityId", select: "name" },
        { path: "countryId", select: "name" },
        { path: "governmentId", select: "name" },
        { path: "regionId", select: "name" },
        { path: "streetId", select: "name" },
        { path: "villageId", select: "name" },
        { path: "sources", select: "source_name" },
      ]),
      req.query
    )
      .filter()
      .sort()
      .limitFields()
      .paginate();

    const [coordinates, numberOfActiveCoordinates] = await Promise.all([
      features.query,
      Coordinate.countDocuments(parsedQuery),
    ]);

    res.status(200).json({
      status: "success",
      numberOfActiveCoordinates,
      results: coordinates.length,
      data: coordinates,
    });
  } catch (error) {
    res.status(500).json({
      status: "fail",
      message: error.message,
    });
  }
};

// Add new coordinates
const addCoordinates = async (req, res) => {
  try {
    const newCoordinates = await Coordinate.create(req.body);

    res.status(201).json({
      status: "success",
      data: newCoordinates,
    });
  } catch (error) {
    res.status(400).json({
      status: "fail",
      message: error.message,
    });
  }
};

// Get coordinates by ID
const getCoordinatesById = async (req, res) => {
  try {
    const coordinates = await Coordinate.findById(req.params.id).populate([
      { path: "sectionId", select: "name" },
      { path: "cityId", select: "name" },
      { path: "countryId", select: "name" },
      { path: "governmentId", select: "name" },
      { path: "regionId", select: "name" },
      { path: "streetId", select: "name" },
      { path: "villageId", select: "name" },
      { path: "sources", select: "source_name" },
    ]);

    if (!coordinates) {
      return res.status(404).json({ message: "Coordinates not found" });
    }

    res.status(200).json({
      status: "success",
      data: coordinates,
    });
  } catch (error) {
    res.status(500).json({
      status: "fail",
      message: error.message,
    });
  }
};

// Update coordinates by ID
const updateCoordinates = async (req, res) => {
  try {
    const updatedCoordinates = await Coordinate.findByIdAndUpdate(
      req.params.id,
      req.body,
      {
        new: true, // Return the updated document
        runValidators: true, // Enforce schema validators
      }
    );

    if (!updatedCoordinates) {
      return res.status(404).json({ message: "Coordinates not found" });
    }

    res.status(200).json({
      status: "success",
      data: updatedCoordinates,
    });
  } catch (error) {
    res.status(500).json({
      status: "fail",
      message: error.message,
    });
  }
};

// Deactivate coordinates by ID
const deactivateCoordinates = async (req, res) => {
  try {
    const deactivatedCoordinates = await Coordinate.findByIdAndUpdate(
      req.params.id,
      { active: false },
      {
        new: true,
        runValidators: true,
      }
    );

    if (!deactivatedCoordinates) {
      return res.status(404).json({ message: "Coordinates not found" });
    }

    res.status(200).json({
      status: "success",
      message: "Coordinates deactivated successfully",
      data: deactivatedCoordinates,
    });
  } catch (error) {
    res.status(500).json({
      status: "fail",
      message: error.message,
    });
  }
};

module.exports = {
  allCoordinates,
  addCoordinates,
  getCoordinatesById,
  updateCoordinates,
  deactivateCoordinates,
};
