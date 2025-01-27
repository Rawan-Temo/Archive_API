const express = require("express");
const router = express.Router();
const BackupController = require("../../controllers/backUp/backupController");
const {
  authenticateToken,
  isAdmin,
  isUser,
} = require("../../middlewares/authMiddleware");
// Route to create a backup
router.post("/", authenticateToken, BackupController.createBackup);

// Route to restore a backup
router.post("/restore", authenticateToken, BackupController.restoreBackup);

module.exports = router;
