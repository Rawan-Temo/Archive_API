const express = require("express");
const router = express.Router();
const regionController = require("../../controllers/Address/regionController");
const { deActivateMany } = require("../../utils/deActivateMany");
const Region = require("../../models/Address/region");

const { autocomplete, search } = require("../../utils/serach");
//

//SEARCH

router.route("/search").post(async (req, res) => {
  await search(Region,["name"],"city",  req, res);
});
router.route("/autoComplete").post(async (req, res) => {
  await autocomplete(Region, ["name"], req, res);
});
//SEARCH
//

router.route("/deActivate-many").patch(async (req, res) => {
  await deActivateMany(Region, req, res);
}); // PATCH /api/sources/deActivate-many/:id
// Route for fetching all regions and creating a new region
router
  .route("/")
  .get(regionController.getAllRegions) // GET /api/regions
  .post(regionController.createRegion); // POST /api/regions

// Route for fetching, updating, and deleting a specific region
router
  .route("/:id")
  .get(regionController.getRegionById) // GET /api/regions/:id
  .patch(regionController.updateRegion); // PATCH /api/regions/:id

// Route for deactivating a region (also removes it from the city's regions array)
router.route("/deActivate/:id").patch(regionController.deactivateRegion); // PATCH /api/regions/deactivate/:id

module.exports = router;
