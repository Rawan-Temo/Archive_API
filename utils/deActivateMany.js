exports.deActivateMany = async (model, req, res) => {
  try {
    const Ids = req.body.ids;

    // Validate input
    if (!Ids || !Array.isArray(Ids) || Ids.length === 0) {
      return res.status(400).json({
        status: "fail",
        message: "Invalid input: 'ids' must be a non-empty array.",
      });
    }

    // Step 1: Soft delete the students by updating the 'active' status
    const result = await model.updateMany(
      { _id: { $in: Ids } }, // Match documents with IDs in the array
      { $set: { active: false } } // Soft delete by setting 'active' to false
    );

    // Check if any documents were modified
    if (result.modifiedCount === 0) {
      return res.status(404).json({
        status: "fail",
        message: `${Ids.length} Ids provided, but no matches found or they were already deactivated.`,
      });
    }

    // Step 2: Return success response
    return res.status(200).json({
      status: "success",
      message: `${result.modifiedCount} out of ${Ids.length}  deactivated successfully.`,
      data: null,
    });
  } catch (error) {
    // Handle unexpected errors
    return res.status(500).json({
      status: "fail",
      message: "An error occurred while deactivating.",
      error: error.message,
    });
  }
};
