const APIFeatures = require("./apiFeatures");

const search = async (model, fields, populate, req, res) => {
  try {
    const query = req.body.search; // The search term from the client

    // Ensure the search query is provided
    if (!query) {
      return res.status(400).json({
        status: "error",
        message: "Search query is required",
      });
    }


    // Perform fuzzy search with dynamic fields
    const tokens = query.split(/\s+/).map((word) => new RegExp(word, "i")); // Split the query into tokens

    // Dynamically create the $or query for all fields
    const searchConditions = tokens.map((token) => ({
      $or: fields.map((field) => ({ [field]: token })), // Create a $or condition for each token and field
    }));
    let populateObject = populate;
    try {
      // Try evaluating the populate string as an object
      populateObject = eval(`(${populate})`);
    } catch (err) {
      // If evaluation fails, fallback to the string as it is
      
    }

  
    // Define the features query
    let features = new APIFeatures(
      model
        .find({
          $and: searchConditions, // Ensure all tokens are matched across any of the specified fields
        })
        .populate(populateObject || ""),
      req.query
    )
      .filter()
      .sort()
      .limitFields()
      .paginate();

    // Count documents matching the query
    const totalResults = new APIFeatures(
      model.countDocuments({
        $and: searchConditions,
      }),
      req.query
    ).filter();

    // Execute the query to fetch paginated results
    let [results, numberOfActiveResults] = await Promise.all([
      features.query,
      totalResults.query.countDocuments(),
    ]);
    // Return the response
    return res.status(200).json({
      status: "success",
      numberOfActiveResults, // Total number of results found
      results: results.length, // Number of results in the current page
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
const autocomplete = async (model, fields, req, res) => {
  try {
    const searchText = req.body.search || "";
    const regex = new RegExp(searchText.split("").join(".*"), "i");
    fields = fields.map((field) => {
      // Split the field into key and value
      return { [field]: regex }; // Use `eval` to turn the string value into a regex
    });

    // Merge the array of objects into a single object
    const dynamicQuery = { $or: fields };

    // Base query for direct matching
    let features = new APIFeatures(
      model.find(dynamicQuery), // Use the dynamically created query object
      req.query
    )
      .filter()
      .sort()
      .limitFields()
      .paginate();

    // Execute query and count matching documents
    let [results, totalResults] = await Promise.all([
      features.query,
      model.countDocuments(dynamicQuery),
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

module.exports = { search, autocomplete };
