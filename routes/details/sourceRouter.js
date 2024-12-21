const express = require("express");
const router = express.Router();
const sourceController = require("../../controllers/details/sourceController");

// Route for fetching all sources and creating a new source
router
  .route("/")
  .get(sourceController.getAllSources) // GET /api/v1/sources
  .post(sourceController.createSource); // POST /api/v1/sources

// Route for fetching, updating, and deleting a specific source
router
  .route("/:id")
  .get(sourceController.getSourceById) // GET /api/v1/sources/:id
  .patch(sourceController.updateSource); // PATCH /api/v1/sources/:id

// Route for deactivating a source
router.route("/deActivate/:id").patch(sourceController.deactivateSource); // PATCH /api/v1/sources/deactivate/:id

module.exports = router;
