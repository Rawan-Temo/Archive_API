const Field = require("../../models/details/field");
const APIFeatures = require("../../utils/apiFeatures");
const { search } = require("../../utils/serach");

// Get all events
const getAllFields = async (req, res) => {
  if (req.query.search) {
    await search(Field, ["name"], "", req, res);
    return;
  }
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
    const features = new APIFeatures(Field.find().lean(), req.query)
      .filter() // Apply filter based on query params
      .sort() // Apply sorting based on query params
      .limitFields() // Limit the fields based on query params
      .paginate(); // Apply pagination based on query params

    const [fields, numberOfActiveFields] = await Promise.all([
      features.query, // Get the fields with applied query features
      Field.countDocuments(parsedQuery), // Count all filtered fields
    ]);

    res.status(200).json({
      status: "success",
      results: fields.length, // Number of fields returned in the current query
      numberOfActiveFields, // Total number of active fields matching filters
      data: fields, // The actual field data
    });
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
};

// Create a new field
const createField = async (req, res) => {
  try {
    const newField = await Field.create(req.body);
    res.status(201).json({
      status: "success",
      data: newField,
    });
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
};

// Get a single field by ID
const getFieldById = async (req, res) => {
  try {
    const field = await Field.findById(req.params.id).lean();
    if (!field) {
      return res.status(404).json({ message: "Field not found" });
    }
    res.status(200).json({
      status: "success",
      data: field,
    });
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
};

// Update a field by ID
const updateField = async (req, res) => {
  try {
    const updatedField = await Field.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true }
    );
    if (!updatedField) {
      return res.status(404).json({ message: "Event not found" });
    }
    res.status(200).json({
      status: "success",
      data: updatedField,
    });
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
};

// Deactivate a field
const deactivateField = async (req, res) => {
  try {
    const field = await Field.findByIdAndUpdate(
      req.params.id,
      { active: false },
      { new: true }
    );
    if (!field) {
      return res.status(404).json({ message: "Field not found" });
    }
    res.status(200).json({
      status: "success",
      message: "Event deactivated",
      data: field,
    });
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
};

module.exports = {
  getAllFields,
  createField,
  getFieldById,
  updateField,
  deactivateField,
};
