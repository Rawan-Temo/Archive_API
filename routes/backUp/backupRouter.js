const express = require("express");
const router = express.Router();
const BackupController = require("../../controllers/backUp/backupController");
const {
  authenticateToken,
  isAdmin,
  isUser,
} = require("../../middlewares/authMiddleware");
// Route to create a backup
router.get("/roots", authenticateToken, isAdmin, BackupController.allRoots);
router.post("/", authenticateToken, isAdmin, BackupController.createBackup);

// Route to restore a backup
router.post("/replace", authenticateToken, isAdmin, (req, res) => {
  BackupController.restoreBackup(req, res, true);
});
router.post("/restore", authenticateToken, isAdmin, (req, res) => {
  BackupController.restoreBackup(req, res, false);
});
module.exports = router;
