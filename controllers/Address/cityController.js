const mongoose = require("mongoose");
const City = require("../../models/Address/city");
const APIFeatures = require("../../utils/apiFeatures");
const { search } = require("../../utils/serach");
const path = require("path");

const getAllCities = async (req, res) => {
  if (req.query.search) {
    await search(
      City,
      ["name"],
      {
        path: "parentId",
        populate: {
          path: "country",
        },
      },
      req,
      res
    );
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
      City.find().populate({
        path: "parentId",
        populate: {
          path: "country",
        },
      }),
      req.query
    )
      .filter()
      .sort()
      .limitFields()
      .paginate();

    // Step 4: Execute both the paginated query and the total count of active records
    const [cities, numberOfActiveCities] = await Promise.all([
      features.query, // Paginated, filtered, and sorted data
      City.countDocuments(parsedQuery), // Total count of filtered records
    ]);

    // Step 5: Respond with the results
    res.status(200).json({
      status: "success",
      results: cities.length, // Number of cities in the current response
      numberOfActiveCities, // Total number of cities matching the filters
      data: cities, // The actual city data
    });
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
};

const createCity = async (req, res) => {
  try {
    const { parent, parentId, name } = req.body;

    // Dynamically get the model
    const ParentModel = mongoose.model(parent);

    // Check if the ID exists in the correct model
    const parentExists = await ParentModel.findById(parentId);
    if (!parentExists) {
      return res.status(400).json({
        status: "fail",
        message: `No ${parent} found with ID ${parentId}`,
      });
    }

    // Create the city
    const newCity = await City.create({ parent, parentId, name });

    res.status(201).json({
      status: "success",
      data: newCity,
    });
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
};
const getCityById = async (req, res) => {
  try {
    const city = await City.findById(req.params.id).populate("parentId");
    if (!city) {
      return res.status(404).json({ message: "No city found with that ID" });
    }
    res.status(200).json({
      status: "success",
      data: city,
    });
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
};

const updateCity = async (req, res) => {
  try {
    const updatedCity = await City.findByIdAndUpdate(req.params.id, req.body, {
      new: true, // Return the updated document
      runValidators: true, // Run schema validations
    });
    if (!updatedCity) {
      return res.status(404).json({ message: "No city found with that ID" });
    }
    res.status(200).json({
      status: "success",
      data: updatedCity,
    });
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
};

const deactivateCity = async (req, res) => {
  try {
    const city = await City.findByIdAndUpdate(
      req.params.id,
      { active: false }, // Set active to false
      { new: true } // Return the updated document
    );

    if (!city) {
      return res.status(404).json({ message: "No city found with that ID" });
    }

    res.status(200).json({
      status: "success",
      message: "City deactivated successfully",
      data: city,
    });
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
};

module.exports = {
  getAllCities,
  createCity,
  getCityById,
  updateCity,
  deactivateCity,
};
