const Village = require("../../models/Address/village");
const APIFeatures = require("../../utils/apiFeatures");
// Get all villages
const getAllVillages = async (req, res) => {
  try {
    // Convert the filtered query into a plain object for counting
    const queryObj = { ...req.query };
    const excludedFields = ["page", "sort", "limit", "fields"];
    excludedFields.forEach((el) => delete queryObj[el]);

    // Parse the query string to convert query parameters like gte/gt/lte/lt into MongoDB operators
    let queryStr = JSON.stringify(queryObj);
    queryStr = queryStr.replace(/\b(gte|gt|lte|lt)\b/g, (match) => `$${match}`);
    const parsedQuery = JSON.parse(queryStr);

    // Apply the parsed filter to count active documents
    const features = new APIFeatures(Village.find(), req.query)
      .filter() // Apply filter based on query params
      .sort() // Apply sorting based on query params
      .limitFields() // Limit the fields based on query params
      .paginate(); // Apply pagination based on query params

    const [villages, numberOfActiveVillages] = await Promise.all([
      features.query, // Get the villages with applied query features
      Village.countDocuments(parsedQuery), // Count all filtered villages
    ]);

    res.status(200).json({
      status: "success",
      results: villages.length, // Number of villages returned in the current query
      numberOfActiveVillages, // Total number of active villages matching filters
      data: villages, // The actual village data
    });
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
};

// Create a new village
const createVillage = async (req, res) => {
  try {
    const newVillage = await Village.create(req.body);
    res.status(201).json({
      status: "success",
      data: newVillage,
    });
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
};

// Get a village by ID
const getVillageById = async (req, res) => {
  try {
    const village = await Village.findById(req.params.id);
    if (!village) {
      return res.status(404).json({ message: "Village not found" });
    }
    res.status(200).json({
      status: "success",
      data: village,
    });
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
};

// Update a village by ID
const updateVillage = async (req, res) => {
  try {
    const village = await Village.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true,
    });
    if (!village) {
      return res.status(404).json({ message: "Village not found" });
    }
    res.status(200).json({
      status: "success",
      data: village,
    });
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
};

// Deactivate a village (set active to false and remove from the region's villages array)
const deactivateVillage = async (req, res) => {
  try {
    const village = await Village.findByIdAndUpdate(
      req.params.id,
      { active: false },
      { new: true }
    );

    if (!village) {
      return res.status(404).json({ message: "Village not found" });
    }

    res.status(200).json({
      status: "success",
      message: "Village deactivated and removed from the region",
      data: village,
    });
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
};

module.exports = {
  getAllVillages,
  createVillage,
  getVillageById,
  updateVillage,
  deactivateVillage,
};
