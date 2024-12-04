const Region = require("../../models/Address/region");
const APIFeatures = require("../../utils/apiFeatures");
// Get all regions
const getAllRegions = async (req, res) => {
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
    const features = new APIFeatures(Region.find(), req.query)
      .filter() // Apply filter based on query params
      .sort() // Apply sorting based on query params
      .limitFields() // Limit the fields based on query params
      .paginate(); // Apply pagination based on query params

    const [regions, numberOfActiveRegions] = await Promise.all([
      features.query, // Get the regions with applied query features
      Region.countDocuments(parsedQuery), // Count all filtered regions
    ]);

    res.status(200).json({
      status: "success",
      results: regions.length, // Number of regions returned in the current query
      numberOfActiveRegions, // Total number of active regions matching filters
      data: regions, // The actual region data
    });
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
};

// Create a new region
const createRegion = async (req, res) => {
  try {
    const newRegion = await Region.create(req.body);
    res.status(201).json({
      status: "success",
      data: newRegion,
    });
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
};

// Get a region by ID
const getRegionById = async (req, res) => {
  try {
    const region = await Region.findById(req.params.id);
    if (!region) {
      return res.status(404).json({ message: "Region not found" });
    }
    res.status(200).json({
      status: "success",
      data: region,
    });
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
};

// Update a region by ID
const updateRegion = async (req, res) => {
  try {
    const region = await Region.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true,
    });
    if (!region) {
      return res.status(404).json({ message: "Region not found" });
    }
    res.status(200).json({
      status: "success",
      data: region,
    });
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
};

// Deactivate a region (set active to false and remove from associated city)
const deactivateRegion = async (req, res) => {
  try {
    const region = await Region.findByIdAndUpdate(
      req.params.id,
      { active: false },
      { new: true }
    );

    if (!region) {
      return res.status(404).json({ message: "Region not found" });
    }

    res.status(200).json({
      status: "success",
      message: "Region deactivated and removed from the city",
      data: region,
    });
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
};

module.exports = {
  getAllRegions,
  createRegion,
  getRegionById,
  updateRegion,
  deactivateRegion,
};
