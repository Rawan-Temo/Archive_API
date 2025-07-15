const APIFeatures = require("../../utils/apiFeatures");
const { search } = require("../../utils/serach");
const County = require("../../models/Address/county");

const getAllCounties = async (req, res) => {
  if (req.query.search) {
    await search(County, ["name"], "country", req, res);

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
      County.find().populate("country").lean(),
      req.query
    )
      .filter()
      .sort()
      .limitFields()
      .paginate();

    // Step 4: Execute both the paginated query and the total count of active records
    const [conties, numberOfActiveConties] = await Promise.all([
      features.query, // Paginated, filtered, and sorted data
      County.countDocuments(parsedQuery), // Total count of filtered records
    ]);

    // Step 5: Respond with the results
    res.status(200).json({
      status: "success",
      results: conties.length, // Number of counties in the current response
      numberOfActiveConties, // Total number of counties matching the filters
      data: conties, // The actual county data
    });
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
};

const createCounty = async (req, res) => {
  try {
    const newCounty = await County.create(req.body);
    res.status(201).json({
      status: "success",
      data: newCounty,
    });
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
};

const getCountyById = async (req, res) => {
  try {
    const county = await County.findById(req.params.id).lean();
    if (!county) {
      return res.status(404).json({ message: "No county found with that ID" });
    }
    res.status(200).json({
      status: "success",
      data: county,
    });
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
};
const updateCounty = async (req, res) => {
  try {
    const updatedCounty = await County.findByIdAndUpdate(
      req.params.id,
      req.body,
      {
        new: true, // Return the updated document
        runValidators: true, // Run schema validations
      }
    );
    if (!updatedCounty) {
      return res.status(404).json({ message: "No County found with that ID" });
    }
    res.status(200).json({
      status: "success",
      data: updatedCounty,
    });
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
};

const deactivateCounty = async (req, res) => {
  try {
    const county = await County.findByIdAndUpdate(
      req.params.id,
      { active: false }, // Set active to false
      { new: true } // Return the updated document
    );

    if (!county) {
      return res.status(404).json({ message: "No county found with that ID" });
    }

    res.status(200).json({
      status: "success",
      message: "county deactivated successfully",
      data: county,
    });
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
};
module.exports = {
  getAllCounties,
  createCounty,

  getCountyById,
  updateCounty,
  deactivateCounty,
};
