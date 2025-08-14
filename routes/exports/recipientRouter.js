const express = require("express");
const router = express.Router();
const recipientController = require("../../controllers/exports/recipientController");
const Recipient = require("../../models/exports/recipient");
const { deActivateMany } = require("../../utils/deActivateMany");
const {
  authenticateToken,
  isAdmin,
  isUser,
} = require("../../middlewares/authMiddleware");

router
  .route("/deActivate-many")
  .patch(authenticateToken, isAdmin, async (req, res) => {
    await deActivateMany(Recipient, req, res);
  });

// Get all recipients and create new recipient
router
  .route("/")
  .get(authenticateToken, isUser, recipientController.getAllRecipients)
  .post(authenticateToken, isAdmin, recipientController.createRecipient);

// Get, update, deactivate by ID
router
  .route("/:id")
  .get(authenticateToken, isUser, recipientController.getRecipientById)
  .patch(authenticateToken, isAdmin, recipientController.updateRecipient);

router
  .route("/deActivate/:id")
  .patch(authenticateToken, isAdmin, recipientController.deactivateRecipient);

module.exports = router;
