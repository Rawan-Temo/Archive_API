const Party = require("../../models/details/party");
const APIFeatures = require("../../utils/apiFeatures");

// Get all parties
const getAllParties = async (req, res) => {
  try {
    const queryObj = { ...req.query };
    const excludedFields = ["page", "sort", "limit", "fields"];
    excludedFields.forEach((el) => delete queryObj[el]);

    let queryStr = JSON.stringify(queryObj);
    queryStr = queryStr.replace(/\b(gte|gt|lte|lt)\b/g, (match) => `$${match}`);
    const parsedQuery = JSON.parse(queryStr);

    const features = new APIFeatures(Party.find(), req.query)
      .filter()
      .sort()
      .limitFields()
      .paginate();

    const [parties, numberOfActiveParties] = await Promise.all([
      features.query, // Get the filtered and paginated parties
      Party.countDocuments(parsedQuery), // Count the filtered active parties
    ]); 

    res.status(200).json({
      status: "success",
      results: parties.length,
      numberOfActiveParties,
      data: parties,
    });
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
};

// Create a new party
const createParty = async (req, res) => {
  try {
    const newParty = await Party.create(req.body);
    res.status(201).json({
      status: "success",
      data: newParty,
    });
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
};

// Get party by ID
const getPartyById = async (req, res) => {
  try {
    const party = await Party.findById(req.params.id);
    if (!party) {
      return res.status(404).json({ message: "Party not found" });
    }
    res.status(200).json({
      status: "success",
      data: party,
    });
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
};

// Update a party by ID
const updateParty = async (req, res) => {
  try {
    const party = await Party.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true,
    });
    if (!party) {
      return res.status(404).json({ message: "Party not found" });
    }
    res.status(200).json({
      status: "success",
      data: party,
    });
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
};

// Deactivate a party (set active to false)
const deactivateParty = async (req, res) => {
  try {
    const party = await Party.findByIdAndUpdate(
      req.params.id,
      { active: false },
      { new: true }
    );

    if (!party) {
      return res.status(404).json({ message: "Party not found" });
    }

    res.status(200).json({
      status: "success",
      message: "Party deactivated",
      data: party,
    });
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
};

module.exports = {
  getAllParties,
  createParty,
  getPartyById,
  updateParty,
  deactivateParty,
};
