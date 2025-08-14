const Department = require("../../models/details/department");
const APIFeatures = require("../../utils/apiFeatures");
const { search } = require("../../utils/serach");

// Get all events
const getAllDepartments = async (req, res) => {
  if (req.query.search) {
    await search(Department, ["name"], "", req, res);
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
    const features = new APIFeatures(Department.find(), req.query)
      .filter() // Apply filter based on query params
      .sort() // Apply sorting based on query params
      .limitFields() // Limit the fields based on query params
      .paginate(); // Apply pagination based on query params

    const [departments, numberOfActiveDepartments] = await Promise.all([
      features.query.lean(), // Get the events with applied query features
      Department.countDocuments(parsedQuery), // Count all filtered events
    ]);

    res.status(200).json({
      status: "success",
      results: departments.length, // Number of events returned in the current query
      numberOfActiveDepartments, // Total number of active events matching filters
      data: departments, // The actual event data
    });
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
};

// Create a new event
const createDepartment = async (req, res) => {
  try {
    const newDepartment = await Department.create(req.body);
    res.status(201).json({
      status: "success",
      data: newDepartment,
    });
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
};

// Get a single event by ID
const getDepartmentById = async (req, res) => {
  try {
    const department = await Department.findById(req.params.id).lean();
    if (!department) {
      return res.status(404).json({ message: "department not found" });
    }
    res.status(200).json({
      status: "success",
      data: department,
    });
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
};

// Update an event by ID
const updateDepartment = async (req, res) => {
  try {
    const updatedDepartment = await Department.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true }
    );
    if (!updatedDepartment) {
      return res.status(404).json({ message: "updatedDepartment not found" });
    }
    res.status(200).json({
      status: "success",
      data: updatedDepartment,
    });
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
};

// Deactivate an event
const deactivateDepartment = async (req, res) => {
  try {
    const department = await Department.findByIdAndUpdate(
      req.params.id,
      { active: false },
      { new: true }
    );
    if (!department) {
      return res.status(404).json({ message: "department not found" });
    }
    res.status(200).json({
      status: "success",
      message: "department deactivated",
      data: department,
    });
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
};

module.exports = {
  getAllDepartments,
  createDepartment,
  getDepartmentById,
  updateDepartment,
  deactivateDepartment,
};
