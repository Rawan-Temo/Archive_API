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
    res.setHeader("Content-Type", "text/plain"); // Ensure text stream response
    res.write("Starting backup process...\n");

    try {
      const result = await BackupService.createBackup(req, res);
      if (result.success) {
        const newBackup = new Backup({ root: result.backupRoot });
        await newBackup.save();
        res.write("Backup saved to database.\n");
        res.write("Backup process completed successfully.\n");
      } else {
        res.write(`Error: ${result.message}\n`);
      }
    } catch (error) {
      res.write(`Error: ${error.message}\n`);
    } finally {
      res.end(); // Ensure the response is properly closed
    }
  },

  restoreBackup: async (req, res) => {
    res.setHeader("Content-Type", "text/plain"); // Stream text response
    res.write("Starting restoration process...\n");

    try {
      const { backupFolderPath } = req.body;
      if (!backupFolderPath) {
        res.write("Error: Backup folder path is required.\n");
        return res.end();
      }

      const backupResult = await BackupService.createBackup(req, res);
      if (backupResult.success) {
        const newBackup = new Backup({ root: backupResult.backupRoot });
        await newBackup.save();
        res.write("Backup before restoration saved.\n");
      }

      const restoreResult = await BackupService.restoreBackup(
        backupFolderPath,
        true,
        req,
        res
      );
      if (restoreResult.success) {
        res.write("Backup restoration completed successfully.\n");
      } else {
        res.write(`Error: ${restoreResult.message}\n`);
      }
    } catch (err) {
      res.write(`Error: ${err.message}\n`);
    } finally {
      res.end();
    }
  },
};

module.exports = BackupController;
