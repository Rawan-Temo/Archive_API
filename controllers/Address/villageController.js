const Village = require("../../models/Address/village");
const APIFeatures = require("../../utils/apiFeatures");
const { search } = require("../../utils/serach");
// Get all villages
const getAllVillages = async (req, res) => {
  if (req.query.search) {
    await search(
      Village,
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
      Village.find()
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

    const [villages, numberOfActiveVillages] = await Promise.all([
      features.query,
      Village.countDocuments(parsedQuery),
    ]);

    res.status(200).json({
      status: "success",
      results: villages.length,
      numberOfActiveVillages,
      data: villages,
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
    const village = await Village.findById(req.params.id).lean();
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
