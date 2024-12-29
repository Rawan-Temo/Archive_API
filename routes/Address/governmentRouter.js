const express = require("express");
const router = express.Router();
const governmentController = require("../../controllers/Address/governmentController");
const { deActivateMany } = require("../../utils/deActivateMany");
const Government = require("../../models/Address/government");
const { search, autocomplete } = require("../../utils/serach");
//SEARCH

router.route("/search").get(async (req, res) => {
  await search(Government, ["name"], "country", req, res);
});
router.route("/autoComplete").get(async (req, res) => {
  await autocomplete(Government, ["name"], req, res);
});
//SEARCH
//
router.route("/deActivate-many").patch(async (req, res) => {
  await deActivateMany(Government, req, res);
}); // PATCH /api/v1/sources/deActivate-many/:id
// Route for fetching all governments and creating a new one
router
  .route("/")
  .get(governmentController.getAllGovernments) // GET /api/v1/governments
  .post(governmentController.createGovernment); // POST /api/v1/governments

// Route for fetching, updating, and deleting a specific government
router
  .route("/:id")
  .get(governmentController.getGovernmentById) // GET /api/v1/governments/:id
  .patch(governmentController.updateGovernment); // PATCH /api/v1/governments/:id
router
  .route("/deActivate/:id")
  .patch(governmentController.deactivateGovernment);
module.exports = router;
