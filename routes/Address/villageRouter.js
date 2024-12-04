const express = require("express");
const router = express.Router();
const villageController = require("../../controllers/Address/villageController");

// Route for fetching all villages and creating a new village
router
  .route("/")
  .get(villageController.getAllVillages) // GET /api/v1/villages
  .post(villageController.createVillage); // POST /api/v1/villages

// Route for fetching, updating, and deleting a specific village
router
  .route("/:id")
  .get(villageController.getVillageById) // GET /api/v1/villages/:id
  .patch(villageController.updateVillage); // PATCH /api/v1/villages/:id

// Route for deactivating a village (also removes it from the region's villages array)
router.route("/deactivate/:id").patch(villageController.deactivateVillage); // PATCH /api/v1/villages/deactivate/:id

module.exports = router;
