const express = require("express");
const router = express.Router();
const partyController = require("../../controllers/details/partyController");
const Party = require("../../models/details/party");
const { deActivateMany } = require("../../utils/deActivateMany");
const { search, autocomplete } = require("../../utils/serach");
const {
  authenticateToken,
  isAdmin,
  isUser,
} = require("../../middlewares/authMiddleware");
//SEARCH

router.route("/search").post(authenticateToken, async (req, res) => {
  await search(Party, ["name"], "", req, res);
});
router.route("/autoComplete").post(authenticateToken, async (req, res) => {
  await autocomplete(Party, ["name"], req, res);
});

//
router.route("/deActivate-many").patch(authenticateToken, async (req, res) => {
  await deActivateMany(Party, req, res);
}); // PATCH /api/sources/deActivate-many/:id
// Route for fetching all parties, creating a new party
router
  .route("/")
  .get(authenticateToken, partyController.getAllParties) // GET /api/parties
  .post(authenticateToken, partyController.createParty); // POST /api/parties

// Route for fetching, updating, and deleting a specific party
router
  .route("/:id")
  .get(authenticateToken, partyController.getPartyById) // GET /api/parties/:id
  .patch(authenticateToken, partyController.updateParty); // PATCH /api/parties/:id

// Route for deactivating a party (setting active to false)
router
  .route("/deActivate/:id")
  .patch(authenticateToken, partyController.deactivateParty); // PATCH /api/parties/deactivate/:id

module.exports = router;
