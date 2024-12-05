const express = require("express");
const router = express.Router();
const partyController = require("../../controllers/details/partyController");

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
