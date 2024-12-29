const Section = require("../../models/details/section");
const APIFeatures = require("../../utils/apiFeatures");

// Get all parties
const getAllSections = async (req, res) => {
  try {
    const queryObj = { ...req.query };
    const excludedFields = ["page", "sort", "limit", "fields"];
    excludedFields.forEach((el) => delete queryObj[el]);

    let queryStr = JSON.stringify(queryObj);
    queryStr = queryStr.replace(/\b(gte|gt|lte|lt)\b/g, (match) => `$${match}`);
    const parsedQuery = JSON.parse(queryStr);

    const features = new APIFeatures(Section.find(), req.query)
      .filter()
      .sort()
      .limitFields()
      .paginate();

    const [sections, numberOfActiveSections] = await Promise.all([
      features.query, // Get the filtered and paginated parties
      Section.countDocuments(parsedQuery), // Count the filtered active parties
    ]);

    res.status(200).json({
      status: "success",
      results: sections.length,
      numberOfActiveSections,
      data: sections,
    });
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
};

// Create a new Section
const createSection = async (req, res) => {
  try {
    const newSection = await Section.create(req.body);
    res.status(201).json({
      status: "success",
      data: newSection,
    });
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
};

// Get Section by ID
const getSectionById = async (req, res) => {
  try {
    const section = await Section.findById(req.params.id);
    if (!section) {
      return res.status(404).json({ message: "Section not found" });
    }
    res.status(200).json({
      status: "success",
      data: section,
    });
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
};

// Update a Section by ID
const updateSection = async (req, res) => {
  try {
    const section = await Section.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true,
    });
    if (!section) {
      return res.status(404).json({ message: "section not found" });
    }
    res.status(200).json({
      status: "success",
      data: section,
    });
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
};

// Deactivate a Section (set active to false)
const deactivateSection = async (req, res) => {
  try {
    const section = await Section.findByIdAndUpdate(
      req.params.id,
      { active: false },
      { new: true }
    );

    if (!section) {
      return res.status(404).json({ message: "section not found" });
    }

    res.status(200).json({
      status: "success",
      message: "section deactivated",
      data: section,
    });
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
};

module.exports = {
  getAllSections,
  createSection,
  getSectionById,
  updateSection,
  deactivateSection,
};
