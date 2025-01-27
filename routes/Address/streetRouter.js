const express = require("express");
const router = express.Router();
const streetController = require("../../controllers/Address/streetController");
const { deActivateMany } = require("../../utils/deActivateMany");
const Street = require("../../models/Address/street");
const { autocomplete, search } = require("../../utils/serach");
const {
  authenticateToken,
  isAdmin,
  isUser,
} = require("../../middlewares/authMiddleware");

//SEARCH

router.route("/search").post(authenticateToken, async (req, res) => {
  await search(Street, ["name"], "city", req, res);
});
router.route("/autoComplete").post(authenticateToken, async (req, res) => {
  await autocomplete(Street, ["name"], req, res);
});

//
router.route("/deActivate-many").patch(authenticateToken, async (req, res) => {
  await deActivateMany(Street, req, res);
}); // PATCH /api/sources/deActivate-many/:id
// Route for fetching all streets, creating a new street, and deactivating a street
router
  .route("/")
  .get(authenticateToken, streetController.getAllStreets) // GET /api/streets
  .post(authenticateToken, streetController.createStreet); // POST /api/streets

// Route for fetching, updating, and deleting a specific street
router
  .route("/:id")
  .get(authenticateToken, streetController.getStreetById) // GET /api/streets/:id
  .patch(authenticateToken, streetController.updateStreet); // PATCH /api/streets/:id

router
  .route("/deActivate/:id")
  .patch(authenticateToken, streetController.deactivateStreet); // PATCH /api/streets/deactivate/:id

module.exports = router;
