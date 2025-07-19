const express = require("express");
const router = express.Router();
const reportController = require("../../controllers/exports/reportController");
const { deActivateMany } = require("../../utils/deActivateMany");
const Report = require("../../models/exports/report");
const {
  authenticateToken,
  isAdmin,
  isUser,
} = require("../../middlewares/authMiddleware");

// Deactivate many
router
  .route("/deActivate-many")
  .patch(authenticateToken, isAdmin, async (req, res) => {
    await deActivateMany(Report, req, res);
  });

// Get all exports and create new export
router
  .route("/")
  .get(authenticateToken, isAdmin, reportController.getAllReports)
  .post(authenticateToken, isAdmin, reportController.createReport);

// Get, update, deactivate by ID
router
  .route("/:id")
  .get(authenticateToken, isAdmin, reportController.getReportById)
  .patch(authenticateToken, isAdmin, reportController.updateReport);

router
  .route("/deActivate/:id")
  .patch(authenticateToken, isAdmin, reportController.deactivateReport);

module.exports = router;
