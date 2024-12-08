const Person = require("../../models/information/person");
const APIFeatures = require("../../utils/apiFeatures");

const allPeople = async (req, res) => {
  try {
    const features = new APIFeatures(Person.find(), req.query);
    const queryObj = { ...req.query };
    const excludedFields = ["page", "sort", "limit", "fields"];
    excludedFields.forEach((el) => delete queryObj[el]);

    // Parse the query string to convert query parameters like gte/gt/lte/lt into MongoDB operators
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
  } catch (Error) {
    res.status(500).json({
      error: Error.message,
    });
  }
};

module.exports = { allPeople };
