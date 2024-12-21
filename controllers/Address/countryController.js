const Country = require("../../models/Address/country");
const APIFeatures = require("../../utils/apiFeatures");
// Create a new country
const createCountry = async (req, res) => {
  try {
    const newCountry = await Country.create(req.body);
    res
      .status(201)
      .json({ message: "Country created successfully", newCountry });
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

// Get all countries
const getAllCountries = async (req, res) => {
  try {
    // Convert the filtered query into a plain object for counting
    const queryObj = { ...req.query };
    const excludedFields = ["page", "sort", "limit", "fields", "month"];
    excludedFields.forEach((el) => delete queryObj[el]);

    // Parse the query string to convert query parameters like gte/gt/lte/lt into MongoDB operators
    let queryStr = JSON.stringify(queryObj);
    queryStr = queryStr.replace(/\b(gte|gt|lte|lt)\b/g, (match) => `$${match}`);
    const parsedQuery = JSON.parse(queryStr);

    // Apply the parsed filter to count active documents
    const features = new APIFeatures(Country.find(), req.query)
      .filter()
      .sort()
      .limitFields()
      .paginate();
    const [countries, numberOfActiveCountries] = await Promise.all([
      features.query, // Get paginated students
      Country.countDocuments(parsedQuery), // Count all filtered documents
    ]);
    res.status(200).json({
      status: "success",
      results: countries.length, // Number of students returned in the current query
      numberOfActiveCountries, // Total number of active students matching filters
      data: countries, // The actual student data
    });
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

// Get a country by name
const getCountryByName = async (req, res) => {
  try {
    const { name } = req.params;
    const country = await Country.findOne({ name });

    if (!country) {
      return res.status(404).json({ message: "Country not found" });
    }
    res.status(200).json(country);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

// Update a country by name
const updateCountry = async (req, res) => {
  try {
    const countryId = req.params.id;
    const updatedCountry = await Country.findByIdAndUpdate(
      countryId,
      req.body,
      {
        new: true, // Return the updated document
        runValidators: true, // Validate the update
      }
    );

    if (!updatedCountry) {
      return res.status(404).json({ message: "Country not found" });
    }

    res
      .status(200)
      .json({ message: "Country updated successfully", updatedCountry });
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

// Delete a country by name
const deActivateCountry = async (req, res) => {
  try {
    const country = await Country.findByIdAndUpdate(req.params.id, {
      active: false,
    });

    if (!country) {
      return res.status(404).json({ message: "Country not found" });
    }

    res.status(200).json({
      status: "success",
      message: "Class deactivated successfully",
      data: null, // No content for successful deactivation
    });
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

module.exports = {
  getAllCountries,
  createCountry,
  getCountryByName,
  updateCountry,
  deActivateCountry,
};
