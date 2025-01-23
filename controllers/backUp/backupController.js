const BackupService = require("../../utils/backupService");

const BackupController = {
  createBackup: async (req, res) => {
    const result = await BackupService.createBackup();
    if (result.success) {
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
