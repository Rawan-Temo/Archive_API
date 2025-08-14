const Recipient = require("../../models/exports/recipient");
const APIFeatures = require("../../utils/apiFeatures");
const { search } = require("../../utils/serach");

// Get all recipients
const getAllRecipients = async (req, res) => {
  if (req.query.search) {
    await search(Recipient, ["name"], "", req, res);
    return;
  }
  try {
    const queryObj = { ...req.query };
    const excludedFields = ["page", "sort", "limit", "fields"];
    excludedFields.forEach((el) => delete queryObj[el]);

    let queryStr = JSON.stringify(queryObj);
    queryStr = queryStr.replace(/\b(gte|gt|lte|lt)\b/g, (match) => `$${match}`);
    const parsedQuery = JSON.parse(queryStr);

    const features = new APIFeatures(Recipient.find(), req.query)
      .filter()
      .sort()
      .limitFields()
      .paginate();

    const [recipients, numberOfActiveRecipients] = await Promise.all([
      features.query.lean(),
      Recipient.countDocuments(parsedQuery),
    ]);

    res.status(200).json({
      status: "success",
      results: recipients.length,
      numberOfActiveRecipients,
      data: recipients,
    });
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
};

// Create a new recipient
const createRecipient = async (req, res) => {
  try {
    const newRecipient = await Recipient.create(req.body);
    res.status(201).json({
      status: "success",
      data: newRecipient,
    });
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
};

// Get a single recipient by ID
const getRecipientById = async (req, res) => {
  try {
    const recipient = await Recipient.findById(req.params.id).lean();
    if (!recipient) {
      return res.status(404).json({ message: "Recipient not found" });
    }
    res.status(200).json({
      status: "success",
      data: recipient,
    });
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
};

// Update a recipient by ID
const updateRecipient = async (req, res) => {
  try {
    const updatedRecipient = await Recipient.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true }
    );
    if (!updatedRecipient) {
      return res.status(404).json({ message: "Recipient not found" });
    }
    res.status(200).json({
      status: "success",
      data: updatedRecipient,
    });
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
};

// Deactivate a recipient
const deactivateRecipient = async (req, res) => {
  try {
    const recipient = await Recipient.findByIdAndUpdate(
      req.params.id,
      { active: false },
      { new: true }
    );
    if (!recipient) {
      return res.status(404).json({ message: "Recipient not found" });
    }
    res.status(200).json({
      status: "success",
      message: "Recipient deactivated",
      data: recipient,
    });
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
};

module.exports = {
  getAllRecipients,
  createRecipient,
  getRecipientById,
  updateRecipient,
  deactivateRecipient,
};
