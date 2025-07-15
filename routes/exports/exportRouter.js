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
  .patch(authenticateToken, isUser, async (req, res) => {
    await deActivateMany(Export, req, res);
  });

// Get all exports and create new export
router
  .route("/")
  .get(authenticateToken, isUser, exportController.getAllExports)
  .post(authenticateToken, isUser, exportController.createExport);

// Get, update, deactivate by ID
router
  .route("/:id")
  .get(authenticateToken, isUser, exportController.getExportById)
  .patch(authenticateToken, isUser, exportController.updateExport);

router
  .route("/deActivate/:id")
  .patch(authenticateToken, isUser, exportController.deactivateExport);

module.exports = router;
