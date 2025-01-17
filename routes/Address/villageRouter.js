const express = require("express");
const router = express.Router();
const villageController = require("../../controllers/Address/villageController");
const { deActivateMany } = require("../../utils/deActivateMany");
const Village = require("../../models/Address/village");
const { search, autocomplete } = require("../../utils/serach");
//SEARCH

router.route("/search").post(async (req, res) => {
  await search(Village, ["name"],"city", req, res);
});
router.route("/autoComplete").post(async (req, res) => {
  await autocomplete(Village, ["name"], req, res);
});

//
router.route("/deActivate-many").patch(async (req, res) => {
  await deActivateMany(Village, req, res);
}); // PATCH /api/sources/deActivate-many/:id
// Route for fetching all villages and creating a new village
router
  .route("/")
  .get(villageController.getAllVillages) // GET /api/villages
  .post(villageController.createVillage); // POST /api/villages

// Route for fetching, updating, and deleting a specific village
router
  .route("/:id")
  .get(villageController.getVillageById) // GET /api/villages/:id
  .patch(villageController.updateVillage); // PATCH /api/villages/:id

// Route for deactivating a village (also removes it from the region's villages array)
router.route("/deActivate/:id").patch(villageController.deactivateVillage); // PATCH /api/villages/deactivate/:id

module.exports = router;
