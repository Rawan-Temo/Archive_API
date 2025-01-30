const express = require("express");
const router = express.Router();
const governmentController = require("../../controllers/Address/governmentController");
const { deActivateMany } = require("../../utils/deActivateMany");
const Government = require("../../models/Address/government");
const {
  authenticateToken,
  isAdmin,
  isUser,
} = require("../../middlewares/authMiddleware");
const { search, autocomplete } = require("../../utils/serach");
//SEARCH

router.route("/search").post(authenticateToken, isUser, async (req, res) => {
  await search(Government, ["name"], "country", req, res);
});
router
  .route("/autoComplete")
  .post(authenticateToken, isUser, async (req, res) => {
    await autocomplete(Government, ["name"], req, res);
  });
//SEARCH
//
router
  .route("/deActivate-many")
  .patch(authenticateToken, isAdmin, async (req, res) => {
    await deActivateMany(Government, req, res);
  }); // PATCH /api/sources/deActivate-many/:id
// Route for fetching all governments and creating a new one
router
  .route("/")
  .get(authenticateToken, isUser, governmentController.getAllGovernments) // GET /api/governments
  .post(authenticateToken, isAdmin, governmentController.createGovernment); // POST /api/governments

// Route for fetching, updating, and deleting a specific government
router
  .route("/:id")
  .get(authenticateToken, isUser, governmentController.getGovernmentById) // GET /api/governments/:id
  .patch(authenticateToken, isAdmin, governmentController.updateGovernment); // PATCH /api/governments/:id
router
  .route("/deActivate/:id")
  .patch(authenticateToken, isAdmin, governmentController.deactivateGovernment);
module.exports = router;
