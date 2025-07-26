const express = require("express");
const router = express.Router();
const exportController = require("../../controllers/exports/exportController");
const { deActivateMany } = require("../../utils/deActivateMany");
const Export = require("../../models/exports/export");
const { search, autocomplete } = require("../../utils/serach");
const {
  authenticateToken,
  isAdmin,
  isUser,
} = require("../../middlewares/authMiddleware");

// Deactivate many
router
  .route("/deActivate-many")
  .patch(authenticateToken, isAdmin, async (req, res) => {
    await deActivateMany(Export, req, res);
  });

// Get all exports and create new export
router
  .route("/")
  .get(authenticateToken, isAdmin, exportController.getAllExports)
  .post(authenticateToken, isAdmin, exportController.createExport);
router
  .route("/expiredExports")
  .get(authenticateToken, isAdmin, exportController.expiredExports);
router
  .route("/countExpiredExports")
  .get(authenticateToken, isAdmin, exportController.countExpiredUnansweredExports);
// Get, update, deactivate by ID
router
  .route("/:id")
  .get(authenticateToken, isAdmin, exportController.getExportById)
  .patch(authenticateToken, isAdmin, exportController.updateExport);

router
  .route("/deActivate/:id")
  .patch(authenticateToken, isAdmin, exportController.deactivateExport);

module.exports = router;
