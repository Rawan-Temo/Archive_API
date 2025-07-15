const APIFeatures = require("../../utils/apiFeatures");
const { search } = require("../../utils/serach");
const Governorate = require("../../models/Address/governorate");

const getAllGovernorates = async (req, res) => {
  if (req.query.search) {
    await search(Governorate, ["name"], "country", req, res);
    return;
  }
  try {
    // Step 1: Filter the query object to remove special fields
    const queryObj = { ...req.query };
    const excludedFields = ["page", "sort", "limit", "fields"];
    excludedFields.forEach((el) => delete queryObj[el]);

    // Step 2: Convert operators like gte/gt/lte/lt into MongoDB query operators
    let queryStr = JSON.stringify(queryObj);
    queryStr = queryStr.replace(/\b(gte|gt|lte|lt)\b/g, (match) => `$${match}`);
    const parsedQuery = JSON.parse(queryStr);

    // Step 3: Use APIFeatures for advanced queries (filter, sort, limitFields, paginate)
    const features = new APIFeatures(
      Governorate.find().populate("country").lean(),
      req.query
    )
      .filter()
      .sort()
      .limitFields()
      .paginate();

    // Step 4: Execute both the paginated query and the total count of active records
    const [governorates, numberOfActiveGovernorates] = await Promise.all([
      features.query, // Paginated, filtered, and sorted data
      Governorate.countDocuments(parsedQuery), // Total count of filtered records
    ]);

    // Step 5: Respond with the results
    res.status(200).json({
      status: "success",
      results: governorates.length, // Number of governorates in the current response
      numberOfActiveGovernorates, // Total number of governorates matching the filters
      data: governorates, // The actual governorate data
    });
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
};

const createGovernorate = async (req, res) => {
  try {
    const newGovernorate = await Governorate.create(req.body);
    res.status(201).json({
      status: "success",
      data: newGovernorate,
    });
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
};

const getGovernorateById = async (req, res) => {
  try {
    const governorate = await Governorate.findById(req.params.id).lean();
    if (!governorate) {
      return res
        .status(404)
        .json({ message: "No governorate found with that ID" });
    }
    res.status(200).json({
      status: "success",
      data: governorate,
    });
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
};

const updateGovernorate = async (req, res) => {
  try {
    const updatedGovernorate = await Governorate.findByIdAndUpdate(
      req.params.id,
      req.body,
      {
        new: true, // Return the updated document
        runValidators: true, // Run schema validations
      }
    );
    if (!updatedGovernorate) {
      return res
        .status(404)
        .json({ message: "No governorate found with that ID" });
    }
    res.status(200).json({
      status: "success",
      data: updatedGovernorate,
    });
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
};

const deactivateGovernorate = async (req, res) => {
  try {
    const governorate = await Governorate.findByIdAndUpdate(
      req.params.id,
      { active: false }, // Set active to false
      { new: true } // Return the updated document
    );

    if (!governorate) {
      return res
        .status(404)
        .json({ message: "No governorate found with that ID" });
    }

    res.status(200).json({
      status: "success",
      message: "Governorate deactivated successfully",
      data: governorate,
    });
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
};

module.exports = {
  getAllGovernorates,
  createGovernorate,
  getGovernorateById,
  updateGovernorate,
  deactivateGovernorate,
};
