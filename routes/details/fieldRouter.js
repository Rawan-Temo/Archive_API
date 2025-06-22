const express = require("express");
const router = express.Router();
const fieldController = require("../../controllers/details/fieldController");
const Field = require("../../models/details/field");
const { deActivateMany } = require("../../utils/deActivateMany");
const { autocomplete } = require("../../utils/serach");
const {
  authenticateToken,
  isAdmin,
  isUser,
} = require("../../middlewares/authMiddleware");
//SEARCH

router
  .route("/autoComplete")
  .post(authenticateToken, isUser, async (req, res) => {
    await autocomplete(Field, ["name"], req, res);
  });

//
router
  .route("/deActivate-many")
  .patch(authenticateToken, isAdmin, async (req, res) => {
    await deActivateMany(Field, req, res);
  }); // PATCH /api/sources/deActivate-many/:id
// Route for fetching all events and creating a new event
router
  .route("/")
  .get(authenticateToken, isUser, fieldController.getAllFields) // GET /api/fields
  .post(authenticateToken, isAdmin, fieldController.createField); // POST /api/fields

// Route for fetching, updating, and deactivating a specific event by ID
router
  .route("/:id")
  .get(authenticateToken, isUser, fieldController.getFieldById) // GET /api/fields/:id
  .patch(authenticateToken, isAdmin, fieldController.updateField); // PATCH /api/fields/:id

router
  .route("/deActivate/:id")
  .patch(authenticateToken, isAdmin, fieldController.deactivateField); // DELETE /api/fields/:id
module.exports = router;
