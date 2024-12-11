const Person = require("../../models/information/person");
const APIFeatures = require("../../utils/apiFeatures");

// Get all people
const allPeople = async (req, res) => {
  try {
    const features = new APIFeatures(
      Person.find()
        .populate("cityId")
        .populate("countryId")
        .populate("governmentId")
        .populate("regionId")
        .populate("streetId")
        .populate("villageId")
        .populate("events")
        .populate("parties")
        .populate("sources"),
      req.query
    );

    const queryObj = { ...req.query };
    const excludedFields = ["page", "sort", "limit", "fields"];
    excludedFields.forEach((el) => delete queryObj[el]);

    let queryStr = JSON.stringify(queryObj);
    queryStr = queryStr.replace(/\b(gte|gt|lte|lt)\b/g, (match) => `$${match}`);
    const parsedQuery = JSON.parse(queryStr);

    const [people, numberOfActivePeople] = await Promise.all([
      features.query,
      Person.countDocuments(parsedQuery),
    ]);

    res.status(200).json({
      status: "success",
      results: people.length,
      numberOfActivePeople,
      people,
    });
  } catch (error) {
    res.status(500).json({
      error: error.message,
    });
  }
};

// Create a new person
const createPerson = async (req, res) => {
  try {
    const newPerson = await Person.create(req.body);
    res.status(201).json({
      status: "success",
      data: newPerson,
    });
  } catch (error) {
    res.status(400).json({
      status: "fail",
      message: error.message,
    });
  }
};

// Get a person by ID
const getPersonById = async (req, res) => {
  try {
    const person = await Person.findById(req.params.id)
      .populate("cityId")
      .populate("countryId")
      .populate("governmentId")
      .populate("regionId")
      .populate("streetId")
      .populate("villageId")
      .populate("events")
      .populate("parties")
      .populate("sources");

    if (!person) {
      return res.status(404).json({ message: "Person not found" });
    }

    res.status(200).json({
      status: "success",
      data: person,
    });
  } catch (error) {
    res.status(500).json({
      status: "fail",
      message: error.message,
    });
  }
};

// Update a person by ID
const updatePerson = async (req, res) => {
  try {
    const updatedPerson = await Person.findByIdAndUpdate(
      req.params.id,
      req.body,
      {
        new: true,
        runValidators: true,
      }
    );

    if (!updatedPerson) {
      return res.status(404).json({ message: "Person not found" });
    }

    res.status(200).json({
      status: "success",
      data: updatedPerson,
    });
  } catch (error) {
    res.status(500).json({
      status: "fail",
      message: error.message,
    });
  }
};

// Deactivate a person by ID
const deactivatePerson = async (req, res) => {
  try {
    const deactivatedPerson = await Person.findByIdAndUpdate(
      req.params.id,
      { active: false },
      { new: true, runValidators: true }
    );

    if (!deactivatedPerson) {
      return res.status(404).json({ message: "Person not found" });
    }

    res.status(200).json({
      status: "success",
      message: "Person deactivated successfully",
      data: deactivatedPerson,
    });
  } catch (error) {
    res.status(500).json({
      status: "fail",
      message: error.message,
    });
  }
};
const allJobs = async(req,res)=>{
  try {
    // Fetch distinct occupations
    const jobs = await Person.distinct("occupation", { occupation: { $ne: null } });

    res.status(200).json({
      status: "success",
      jobs,
    });
  } catch (error) {
    console.error("Error retrieving distinct jobs:", error);
    res.status(500).json({
      status: "error",
      message: "Error retrieving distinct jobs",
    });
  }
}
module.exports = {
  allPeople,
  createPerson,
  getPersonById,
  updatePerson,
  deactivatePerson,
  allJobs
};
