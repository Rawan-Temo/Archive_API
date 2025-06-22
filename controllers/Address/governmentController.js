const Government = require("../../models/Address/government");
const APIFeatures = require("../../utils/apiFeatures");
const { search } = require("../../utils/serach");

const getAllGovernments = async (req, res) => {
  if (req.query.search) {
    await search(Government, ["name"], "country", req, res);
    return;
  } 
    try {
      // Step 1: Filter the query object to remove special fields
      const queryObj = { ...req.query };
      const excludedFields = ["page", "sort", "limit", "fields"];
      excludedFields.forEach((el) => delete queryObj[el]);

      // Step 2: Convert operators like gte/gt/lte/lt into MongoDB query operators
      let queryStr = JSON.stringify(queryObj);
      queryStr = queryStr.replace(
        /\b(gte|gt|lte|lt)\b/g,
        (match) => `$${match}`
      );
      const parsedQuery = JSON.parse(queryStr);

      // Step 3: Use APIFeatures for advanced queries (filter, sort, limitFields, paginate)
      const features = new APIFeatures(
        Government.find().populate("country"),
        req.query
      )
        .filter()
        .sort()
        .limitFields()
        .paginate();

      // Step 4: Execute both the paginated query and the total count of active records
      const [governments, numberOfActiveGovernments] = await Promise.all([
        features.query, // Paginated, filtered, and sorted data
        Government.countDocuments(parsedQuery), // Total count of filtered records
      ]);

      // Step 5: Respond with the results
      res.status(200).json({
        status: "success",
        results: governments.length, // Number of governments in the current response
        numberOfActiveGovernments, // Total number of governments matching the filters
        data: governments, // The actual government data
      });
    } catch (err) {
      res.status(400).json({ message: err.message });
    }
  
};

const createGovernment = async (req, res) => {
  try {
    const newGovernment = await Government.create(req.body);
    res.status(201).json({
      status: "success",
      data: newGovernment,
    });
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
};

const getGovernmentById = async (req, res) => {
  try {
    const government = await Government.findById(req.params.id);
    if (!government) {
      return res
        .status(404)
        .json({ message: "No government found with that ID" });
    }
    res.status(200).json({
      status: "success",
      data: government,
    });
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
};

const updateGovernment = async (req, res) => {
  try {
    const updatedGovernment = await Government.findByIdAndUpdate(
      req.params.id,
      req.body,
      {
        new: true, // Return the updated document
        runValidators: true, // Run schema validations
      }
    );
    if (!updatedGovernment) {
      return res
        .status(404)
        .json({ message: "No government found with that ID" });
    }
    res.status(200).json({
      status: "success",
      data: updatedGovernment,
    });
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
};

const deactivateGovernment = async (req, res) => {
  try {
    const government = await Government.findByIdAndUpdate(
      req.params.id,
      { active: false }, // Set active to false
      { new: true } // Return the updated document
    );

    if (!government) {
      return res
        .status(404)
        .json({ message: "No government found with that ID" });
    }

    res.status(200).json({
      status: "success",
      message: "Government deactivated successfully",
      data: government,
    });
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
};

module.exports = {
  getAllGovernments,
  createGovernment,
  getGovernmentById,
  updateGovernment,
  deactivateGovernment,
};
