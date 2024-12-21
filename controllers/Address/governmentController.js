const Government = require("../../models/Address/government");
const APIFeatures = require("../../utils/apiFeatures");

const getAllGovernments = async (req, res) => {
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
    const features = new APIFeatures(Government.find().populate('country'), req.query)
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

const search = async (req, res) => {
  try {
    const query = req.body.search; // The search term from the client

    // Ensure the search query is provided
    if (!query) {
      return res.status(400).json({
        status: "error",
        message: "Search query is required",
      });
    }

    console.log("Search Query:", query);

    // Perform fuzzy search using mongoose-fuzzy-searching plugin
    const features = new APIFeatures(Government.fuzzySearch(query), req.query)
      .filter()
      .sort()
      .limitFields()
      .paginate();
    const featurersCount = new APIFeatures(
      Government.fuzzySearch(query),
      req.query
    ).filter();

    let [results, numberOfActiveGovernments] = await Promise.all([
      features.query,
      featurersCount.query.countDocuments(),
    ]);

    return res.status(200).json({
      status: "success",
      numberOfActiveGovernments, // Total number of results found
      data: results, // The matching documents
    });
  } catch (err) {
    console.error("Error during search:", err); // Log error for debugging
    return res.status(500).json({
      status: "error",
      message: err.message || "Something went wrong during the search",
    });
  }
};
const autocomplete = async (req, res) => {
  try {
    const searchText = req.body.search || "";
    const regex = new RegExp(searchText.split("").join(".*"), "i");

    // Base query for direct matching
    let features = new APIFeatures(
      Government.find({
        $or: [{ name: regex }],
      }),
      req.query
    )
      .filter()
      .sort()
      .limitFields()
      .paginate();

    // Execute query and count matching documents
    let [results, totalResults] = await Promise.all([
      features.query,
      Government.countDocuments({
        $or: [{ name: regex }],
      }),
    ]);
    res.status(200).json({
      status: "success",
      totalResults,
      results: results.length,
      data: results,
    });
  } catch (err) {
    console.error("Error during search:", err);
    return res.status(500).json({
      status: "error",
      message: err.message || "Something went wrong during the search",
    });
  }
};
module.exports = {
  getAllGovernments,
  createGovernment,
  getGovernmentById,
  updateGovernment,
  deactivateGovernment,
  search,
  autocomplete,
};
