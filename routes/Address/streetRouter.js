const express = require("express");
const router = express.Router();
const streetController = require("../../controllers/Address/streetController");
const { deActivateMany } = require("../../utils/deActivateMany");
const Street = require("../../models/Address/street");
const { autocomplete, search } = require("../../utils/serach");
//

//SEARCH

router.route("/search").post(async (req, res) => {
  await search(Street,["name"],"city",  req, res);
});
router.route("/autoComplete").post(async (req, res) => {
  await autocomplete(Street, ["name"], req, res);
});


//
router.route("/deActivate-many").patch(async (req, res) => {
  await deActivateMany(Street, req, res);
}); // PATCH /api/v1/sources/deActivate-many/:id
// Route for fetching all streets, creating a new street, and deactivating a street
router
  .route("/")
  .get(streetController.getAllStreets) // GET /api/v1/streets
  .post(streetController.createStreet); // POST /api/v1/streets

// Route for fetching, updating, and deleting a specific street
router
  .route("/:id")
  .get(streetController.getStreetById) // GET /api/v1/streets/:id
  .patch(streetController.updateStreet); // PATCH /api/v1/streets/:id

// Route for deactivating a specific street and removing it from the city's street array
router.route("/deActivate/:id").patch(streetController.deactivateStreet); // PATCH /api/v1/streets/deactivate/:id

module.exports = router;
