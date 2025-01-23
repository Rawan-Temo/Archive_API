const express = require("express");
const router = express.Router();
const BackupController = require("../../controllers/backUp/backupController");

// Route to create a backup
router.post("/", BackupController.createBackup);

// Route to restore a backup
router.post("/restore", BackupController.restoreBackup);

module.exports = router;
