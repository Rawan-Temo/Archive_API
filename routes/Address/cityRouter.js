const express = require("express");
const router = express.Router();
const cityController = require("../../controllers/Address/cityController");
const { deActivateMany } = require("../../utils/deActivateMany");
const City = require("../../models/Address/city");
//
router.route("/deActivate-many").patch(async (req, res) => {
  await deActivateMany(City, req, res);
}); // PATCH /api/v1/sources/deActivate-many/:id
// Route for fetching all cities and creating a new one
router
  .route("/")
  .get(cityController.getAllCities) // GET /api/v1/cities
  .post(cityController.createCity); // POST /api/v1/cities

// Route for fetching, updating, and deleting a specific city
router
  .route("/:id")
  .get(cityController.getCityById) // GET /api/v1/cities/:id
  .patch(cityController.updateCity); // PATCH /api/v1/cities/:id 

// Route to deactivate a specific city
router
  .route("/deActivate/:id")
  .patch(cityController.deactivateCity); // PATCH /api/v1/cities/deActivate/:id

module.exports = router;
