const express = require("express");
const router = express.Router();
const resultController = require("../../controllers/exports/resultController");
const { deActivateMany } = require("../../utils/deActivateMany");
const Result = require("../../models/exports/result");
const {
  authenticateToken,
  isAdmin,
  isUser,
} = require("../../middlewares/authMiddleware");

// Deactivate many
router
  .route("/deActivate-many")
  .patch(authenticateToken, isAdmin, async (req, res) => {
    await deActivateMany(Result, req, res);
  });

// Get all exports and create new export
router
  .route("/")
  .get(authenticateToken, isAdmin, resultController.getAllResults)
  .post(authenticateToken, isAdmin, resultController.createResult);

// Get, update, deactivate by ID
router
  .route("/:id")
  .get(authenticateToken, isAdmin, resultController.getResultById)
  .patch(authenticateToken, isAdmin, resultController.updateResult);

router
  .route("/deActivate/:id")
  .patch(authenticateToken, isAdmin, resultController.deactivateResult);

module.exports = router;
