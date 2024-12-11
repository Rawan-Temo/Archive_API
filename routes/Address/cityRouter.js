const express = require("express");
const router = express.Router();
const cityController = require("../../controllers/Address/cityController");

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
