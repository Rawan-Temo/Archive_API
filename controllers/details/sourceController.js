const Source = require("../../models/details/source");
const APIFeatures = require("../../utils/apiFeatures");

// Get all sources
const getAllSources = async (req, res) => {
  try {
    const queryObj = { ...req.query };
    const excludedFields = ["page", "sort", "limit", "fields"];
    excludedFields.forEach((el) => delete queryObj[el]);

    let queryStr = JSON.stringify(queryObj);
    queryStr = queryStr.replace(/\b(gte|gt|lte|lt)\b/g, (match) => `$${match}`);
    const parsedQuery = JSON.parse(queryStr);

    // Apply the parsed filter to count active documents
    const features = new APIFeatures(Source.find(), req.query)
      .filter()
      .sort()
      .limitFields()
      .paginate();

    const [sources, numberOfActiveSources] = await Promise.all([
      features.query,
      Source.countDocuments(parsedQuery), // Count all filtered sources
    ]);

    res.status(200).json({
      status: "success",
      results: sources.length,
      numberOfActiveSources,
      data: sources,
    });
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
};

// Create a new source
const createSource = async (req, res) => {
  try {
    const newSource = await Source.create(req.body);
    res.status(201).json({
      status: "success",
      data: newSource,
    });
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
};

// Get a source by ID
const getSourceById = async (req, res) => {
  try {
    const source = await Source.findById(req.params.id);
    if (!source) {
      return res.status(404).json({ message: "Source not found" });
    }
    res.status(200).json({
      status: "success",
      data: source,
    });
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
};

// Update a source by ID
const updateSource = async (req, res) => {
  try {
    const source = await Source.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true,
    });
    if (!source) {
      return res.status(404).json({ message: "Source not found" });
    }
    res.status(200).json({
      status: "success",
      data: source,
    });
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
};

// Deactivate a source (set active to false)
const deactivateSource = async (req, res) => {
  try {
    const source = await Source.findByIdAndUpdate(
      req.params.id,
      { active: false },
      { new: true }
    );

    if (!source) {
      return res.status(404).json({ message: "Source not found" });
    }

    res.status(200).json({
      status: "success",
      message: "Source deactivated",
      data: source,
    });
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
};

module.exports = {
  getAllSources,
  createSource,
  getSourceById,
  updateSource,
  deactivateSource,
};
