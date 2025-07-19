const Event = require("../../models/details/event");
const APIFeatures = require("../../utils/apiFeatures");
const { search } = require("../../utils/serach");

// Get all events
const getAllEvents = async (req, res) => {
  if (req.query.search) {
    await search(Event, ["name"], "", req, res);
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
    const features = new APIFeatures(Event.find(), req.query)
      .filter() // Apply filter based on query params
      .sort() // Apply sorting based on query params
      .limitFields() // Limit the fields based on query params
      .paginate(); // Apply pagination based on query params

    const [events, numberOfActiveEvents] = await Promise.all([
      features.query.lean(), // Get the events with applied query features
      Event.countDocuments(parsedQuery), // Count all filtered events
    ]);

    res.status(200).json({
      status: "success",
      results: events.length, // Number of events returned in the current query
      numberOfActiveEvents, // Total number of active events matching filters
      data: events, // The actual event data
    });
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
};

// Create a new event
const createEvent = async (req, res) => {
  try {
    const newEvent = await Event.create(req.body);
    res.status(201).json({
      status: "success",
      data: newEvent,
    });
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
};

// Get a single event by ID
const getEventById = async (req, res) => {
  try {
    const event = await Event.findById(req.params.id).lean();
    if (!event) {
      return res.status(404).json({ message: "Event not found" });
    }
    res.status(200).json({
      status: "success",
      data: event,
    });
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
};

// Update an event by ID
const updateEvent = async (req, res) => {
  try {
    const updatedEvent = await Event.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true }
    );
    if (!updatedEvent) {
      return res.status(404).json({ message: "Event not found" });
    }
    res.status(200).json({
      status: "success",
      data: updatedEvent,
    });
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
};

// Deactivate an event
const deactivateEvent = async (req, res) => {
  try {
    const event = await Event.findByIdAndUpdate(
      req.params.id,
      { active: false },
      { new: true }
    );
    if (!event) {
      return res.status(404).json({ message: "Event not found" });
    }
    res.status(200).json({
      status: "success",
      message: "Event deactivated",
      data: event,
    });
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
};

module.exports = {
  getAllEvents,
  createEvent,
  getEventById,
  updateEvent,
  deactivateEvent,
};
