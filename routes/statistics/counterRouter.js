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
  .get(authenticateToken, isAdmin, counterController.countDocuments);
module.exports = router;
