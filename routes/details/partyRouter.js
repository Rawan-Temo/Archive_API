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
}); // PATCH /api/v1/sources/deActivate-many/:id
// Route for fetching all parties, creating a new party
router
  .route("/")
  .get(partyController.getAllParties) // GET /api/v1/parties
  .post(partyController.createParty); // POST /api/v1/parties

// Route for fetching, updating, and deleting a specific party
router
  .route("/:id")
  .get(partyController.getPartyById) // GET /api/v1/parties/:id
  .patch(partyController.updateParty); // PATCH /api/v1/parties/:id

// Route for deactivating a party (setting active to false)
router.route("/deActivate/:id").patch(partyController.deactivateParty); // PATCH /api/v1/parties/deactivate/:id

module.exports = router;
