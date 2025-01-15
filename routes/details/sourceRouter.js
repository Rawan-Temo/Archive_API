const express = require("express");
const router = express.Router();
const sourceController = require("../../controllers/details/sourceController");
const { deActivateMany } = require("../../utils/deActivateMany");
const Source = require("../../models/details/source");
const { search, autocomplete } = require("../../utils/serach");
//SEARCH

router.route("/search").post(async (req, res) => {
  await search(Source, ["source_name"], "", req, res);
});
router.route("/autoComplete").post(async (req, res) => {
  await autocomplete(Source, ["source_name"], req, res);
});

//
router.route("/deActivate-many").patch(async (req, res) => {
  await deActivateMany(Source, req, res);
}); // PATCH /api/sources/deActivate-many/:id

// Route for fetching all sources and creating a new source

router
  .route("/")
  .get(sourceController.getAllSources) // GET /api/sources
  .post(sourceController.createSource); // POST /api/sources

// Route for fetching, updating, and deleting a specific source
router
  .route("/:id")
  .get(sourceController.getSourceById) // GET /api/sources/:id
  .patch(sourceController.updateSource); // PATCH /api/sources/:id

// Route for deactivating a source
router.route("/deActivate/:id").patch(sourceController.deactivateSource); // PATCH /api/sources/deactivate/:id

module.exports = router;
