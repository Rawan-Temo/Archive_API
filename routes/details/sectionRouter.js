const express = require("express");
const router = express.Router();
const sectionController = require("../../controllers/details/sectionController");
const Section = require("../../models/details/section");
const { deActivateMany } = require("../../utils/deActivateMany");
const { search, autocomplete } = require("../../utils/serach");
//SEARCH

router.route("/search").post(async (req, res) => {
  await search(Section, ["name"], "", req, res);
});
router.route("/autoComplete").post(async (req, res) => {
  await autocomplete(Section, ["name"], req, res);
});

//
router.route("/deActivate-many").patch(async (req, res) => {
  await deActivateMany(Section, req, res);
}); // PATCH /api/sources/deActivate-many/:id
// Route for fetching all parties, creating a new Section
router
  .route("/")
  .get(sectionController.getAllSections) // GET /api/Sections
  .post(sectionController.createSection); // POST /api/Sections

// Route for fetching, updating, and deleting a specific Section
router
  .route("/:id")
  .get(sectionController.getSectionById) // GET /api/Sections/:id
  .patch(sectionController.updateSection); // PATCH /api/Sections/:id

// Route for deactivating a party (setting active to false)
router.route("/deActivate/:id").patch(sectionController.deactivateSection); // PATCH /api/Sections/deactivate/:id

module.exports = router;
