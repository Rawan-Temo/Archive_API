const express = require("express");
const router = express.Router();
const cityController = require("../../controllers/Address/cityController");
const { deActivateMany } = require("../../utils/deActivateMany");
const City = require("../../models/Address/city");
const { autocomplete, search } = require("../../utils/serach");
//

//SEARCH

router.route("/search").post(async (req, res) => {
  await search(City, ["name"], "country", req, res);
});
router.route("/autoComplete").post(async (req, res) => {
  await autocomplete(City, ["name"], req, res);
});
//SEARCH

router.route("/deActivate-many").patch(async (req, res) => {
  await deActivateMany(City, req, res);
}); // PATCH /api/sources/deActivate-many/:id

// Route for fetching all cities and creating a new one
router
  .route("/")
  .get(cityController.getAllCities) // GET /api/cities
  .post(cityController.createCity); // POST /api/cities

// Route for fetching, updating, and deleting a specific city
router
  .route("/:id")
  .get(cityController.getCityById) // GET /api/cities/:id
  .patch(cityController.updateCity); // PATCH /api/cities/:id

// Route to deactivate a specific city
router.route("/deActivate/:id").patch(cityController.deactivateCity); // PATCH /api/cities/deActivate/:id

module.exports = router;
