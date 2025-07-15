const Region = require("../../models/Address/region");
const APIFeatures = require("../../utils/apiFeatures");
const { search } = require("../../utils/serach");
// Get all regions
const getAllRegions = async (req, res) => {
  if (req.query.search) {
    await search(
      Region,
      ["name"],
      {
        path: "city",
        populate: {
          path: "parentId",
          select: "country name", // assuming `country` is a field in parentId
          populate: {
            path: "country",
            select: "name", // select the fields you want from country
          },
        },
      },
      req,
      res
    );
    return;
  }
  try {
    const queryObj = { ...req.query };
    const excludedFields = ["page", "sort", "limit", "fields"];
    excludedFields.forEach((el) => delete queryObj[el]);

    let queryStr = JSON.stringify(queryObj);
    queryStr = queryStr.replace(/\b(gte|gt|lte|lt)\b/g, (match) => `$${match}`);
    const parsedQuery = JSON.parse(queryStr);

    // Apply the parsed filter to count active documents
    const features = new APIFeatures(
      Region.find()
        .populate({
          path: "city",
          populate: {
            path: "parentId",
            select: "country name", // assuming `country` is a field in parentId
            populate: {
              path: "country",
              select: "name", // select the fields you want from country
            },
          },
        })
        .lean(),
      req.query
    )
      .filter()
      .sort()
      .limitFields()
      .paginate();

    const [regions, numberOfActiveRegions] = await Promise.all([
      features.query,
      Region.countDocuments(parsedQuery), // Count all filtered regions
    ]);

    res.status(200).json({
      status: "success",
      results: regions.length,
      numberOfActiveRegions,
      data: regions,
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
    const region = await Region.findById(req.params.id).lean();
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

// Deactivate a region
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
