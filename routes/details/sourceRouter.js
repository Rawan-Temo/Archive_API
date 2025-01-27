const express = require("express");
const router = express.Router();
const sourceController = require("../../controllers/details/sourceController");
const { deActivateMany } = require("../../utils/deActivateMany");
const Source = require("../../models/details/source");
const { search, autocomplete } = require("../../utils/serach");
const {
  authenticateToken,
  isAdmin,
  isUser,
} = require("../../middlewares/authMiddleware");
//SEARCH

router.route("/search").post(authenticateToken, async (req, res) => {
  await search(Source, ["source_name"], "", req, res);
});
router.route("/autoComplete").post(authenticateToken, async (req, res) => {
  await autocomplete(Source, ["source_name"], req, res);
});

//
router.route("/deActivate-many").patch(authenticateToken, async (req, res) => {
  await deActivateMany(Source, req, res);
}); // PATCH /api/sources/deActivate-many/:id

// Route for fetching all sources and creating a new source

router
  .route("/")
  .get(authenticateToken, sourceController.getAllSources) // GET /api/sources
  .post(authenticateToken, sourceController.createSource); // POST /api/sources

// Route for fetching, updating, and deleting a specific source
router
  .route("/:id")
  .get(authenticateToken, sourceController.getSourceById) // GET /api/sources/:id
  .patch(authenticateToken, sourceController.updateSource); // PATCH /api/sources/:id

// Route for deactivating a source
router
  .route("/deActivate/:id")
  .patch(authenticateToken, sourceController.deactivateSource); // PATCH /api/sources/deactivate/:id

module.exports = router;
