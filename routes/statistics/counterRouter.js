const express = require("express");
const {
  authenticateToken,
  isAdmin,
  isUser,
} = require("../../middlewares/authMiddleware");
const counterController = require("../../controllers/statistics/counterController");
const router = express.Router();
router
  .route("/CountDocuments")
  .get(authenticateToken, isUser, counterController.countDocuments);

// exports for each recipient
router
  .route("/CountExports")
  .get(authenticateToken, isUser, counterController.countExportsPerRecipient);
router
  .route("/countInformation")
  .get(authenticateToken, isUser, counterController.countInformation);
router
  .route("/departmentInformation")
  .get(authenticateToken, isUser, counterController.departmentForSections);
module.exports = router;
