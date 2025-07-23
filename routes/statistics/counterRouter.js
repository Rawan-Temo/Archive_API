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
router
  .route("/countInformation")
  .get(authenticateToken, isUser, counterController.countInformation);
module.exports = router;
