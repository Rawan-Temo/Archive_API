const express = require("express");
const router = express.Router();
const governmentController = require("../../controllers/Address/governmentController");

// Route for fetching all governments and creating a new one
router.route("/search").get(governmentController.search);
router.route("/autocomplete").get(governmentController.autocomplete);
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
