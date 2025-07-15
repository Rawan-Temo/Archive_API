const Street = require("../../models/Address/street");
const APIFeatures = require("../../utils/apiFeatures");
const { search } = require("../../utils/serach");

// Create a new street
const createStreet = async (req, res) => {
  try {
    const newStreet = await Street.create(req.body);
    res.status(201).json({
      status: "success",
      message: "Street created successfully",
      data: newStreet,
    });
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
};

// Get all streets with pagination and filtering
const getAllStreets = async (req, res) => {
  if (req.query.search) {
    await search(
      Street,
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
      Street.find()
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

    const [streets, numberOfActiveStreets] = await Promise.all([
      features.query,
      Street.countDocuments(parsedQuery), // Count all filtered documents
    ]);

    res.status(200).json({
      status: "success",
      results: streets.length,
      numberOfActiveStreets,
      data: streets,
    });
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
};

// Get a street by ID
const getStreetById = async (req, res) => {
  try {
    const street = await Street.findById(req.params.id).lean();
    if (!street) {
      return res.status(404).json({ message: "No street found with that ID" });
    }
    res.status(200).json({
      status: "success",
      data: street,
    });
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
};

// Update a street by ID
const updateStreet = async (req, res) => {
  try {
    const updatedStreet = await Street.findByIdAndUpdate(
      req.params.id,
      req.body,
      {
        new: true,
        runValidators: true,
      }
    );

    if (!updatedStreet) {
      return res.status(404).json({ message: "No street found with that ID" });
    }

    res.status(200).json({
      status: "success",
      message: "Street updated successfully",
      data: updatedStreet,
    });
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
};

// Deactivate a street
const deactivateStreet = async (req, res) => {
  try {
    // Deactivate the street
    const street = await Street.findByIdAndUpdate(
      req.params.id,
      { active: false },
      { new: true }
    );

    if (!street) {
      return res.status(404).json({ message: "No street found with that ID" });
    }

    res.status(200).json({
      status: "success",
      message: "Street deactivated",
      data: street,
    });
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
};

module.exports = {
  getAllStreets,
  createStreet,
  getStreetById,
  updateStreet,
  deactivateStreet,
};
