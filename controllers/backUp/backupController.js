const BackupService = require("../../utils/backupService");
const Backup = require("../../models/backup/backup");
const APIFeatures = require("../../utils/apiFeatures");

const BackupController = {
  allRoots: async (req, res) => {
    try {
      // Convert the filtered query into a plain object for counting
      const queryObj = { ...req.query };
      const excludedFields = ["page", "sort", "limit", "fields", "month"];
      excludedFields.forEach((el) => delete queryObj[el]);

      // Parse the query string to convert query parameters like gte/gt/lte/lt into MongoDB operators
      let queryStr = JSON.stringify(queryObj);
      queryStr = queryStr.replace(
        /\b(gte|gt|lte|lt)\b/g,
        (match) => `$${match}`
      );
      const parsedQuery = JSON.parse(queryStr);

      // Apply the parsed filter to count active documents
      const features = new APIFeatures(Backup.find(), req.query)
        .filter()
        .sort()
        .limitFields()
        .paginate();
      const [roots, numberOfroots] = await Promise.all([
        features.query, // Get paginated students
        Backup.countDocuments(parsedQuery), // Count all filtered documents
      ]);
      res.status(200).json({
        status: "success",
        results: roots.length, // Number of students returned in the current query
        numberOfroots, // Total number of active students matching filters
        data: roots, // The actual student data
      });
    } catch (error) {
      res.status(400).json({ message: error.message });
    }
  },
  createBackup: async (req, res) => {
    const result = await BackupService.createBackup();
    if (result.success) {
      // Store the backup root in the database
      const newBackup = new Backup({ root: result.backupRoot });
      await newBackup.save();

      res.status(200).json({ message: result.message });
    } else {
      res.status(500).json({ error: result.message });
    }
  },

  restoreBackup: async (req, res) => {
    const { backupFolderPath } = req.body; // Pass the backup folder path in the request body
    if (!backupFolderPath) {
      return res.status(400).json({ error: "Backup folder path is required" });
    }
    try {
      console.log("Starting backup...");
      const result = await BackupService.createBackup();
      if (result.success) {
        console.log(result.message);
      } else {
        console.error(result.message, result.error);
      }
    } catch (err) {
      console.error("Error during backup:", err);
    }

    const result = await BackupService.restoreBackup(backupFolderPath);
    if (result.success) {
      res.status(200).json({ message: result.message });
    } else {
      res.status(500).json({ error: result.message });
    }
  },
};

module.exports = BackupController;
