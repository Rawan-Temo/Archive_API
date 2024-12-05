const express = require("express");
const router = express.Router();
const regionController = require("../../controllers/Address/regionController");

// Route for fetching all regions and creating a new region
router
  .route("/")
  .get(regionController.getAllRegions) // GET /api/v1/regions
  .post(regionController.createRegion); // POST /api/v1/regions

// Route for fetching, updating, and deleting a specific region
router
  .route("/:id")
  .get(regionController.getRegionById) // GET /api/v1/regions/:id
  .patch(regionController.updateRegion); // PATCH /api/v1/regions/:id

// Route for deactivating a region (also removes it from the city's regions array)
router.route("/deActivate/:id").patch(regionController.deactivateRegion); // PATCH /api/v1/regions/deactivate/:id

module.exports = router;
