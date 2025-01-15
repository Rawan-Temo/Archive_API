const express = require("express");
const router = express.Router();
const partyController = require("../../controllers/details/partyController");
const Party = require("../../models/details/party");
const { deActivateMany } = require("../../utils/deActivateMany");
const { search, autocomplete } = require("../../utils/serach");
//SEARCH

router.route("/search").post(async (req, res) => {
  await search(Party, ["name"],"", req, res);
});
router.route("/autoComplete").post(async (req, res) => {
  await autocomplete(Party, ["name"], req, res);
});


//
router.route("/deActivate-many").patch(async (req, res) => {
  await deActivateMany(Party, req, res);
}); // PATCH /api/sources/deActivate-many/:id
// Route for fetching all parties, creating a new party
router
  .route("/")
  .get(partyController.getAllParties) // GET /api/parties
  .post(partyController.createParty); // POST /api/parties

// Route for fetching, updating, and deleting a specific party
router
  .route("/:id")
  .get(partyController.getPartyById) // GET /api/parties/:id
  .patch(partyController.updateParty); // PATCH /api/parties/:id

// Route for deactivating a party (setting active to false)
router.route("/deActivate/:id").patch(partyController.deactivateParty); // PATCH /api/parties/deactivate/:id

module.exports = router;
