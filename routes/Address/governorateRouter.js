const express = require("express");
const router = express.Router();
const governorateController = require("../../controllers/Address/governorateController");
const { deActivateMany } = require("../../utils/deActivateMany");
const Governorate = require("../../models/Address/governorate");
const {
  authenticateToken,
  isAdmin,
  isUser,
} = require("../../middlewares/authMiddleware");
const { search, autocomplete } = require("../../utils/serach");
//SEARCH

router.route("/search").post(authenticateToken, isUser, async (req, res) => {
  await search(Governorate, ["name"], "country", req, res);
});
router
  .route("/autoComplete")
  .post(authenticateToken, isUser, async (req, res) => {
    await autocomplete(Governorate, ["name"], req, res);
  });
//SEARCH
//
router
  .route("/deActivate-many")
  .patch(authenticateToken, isAdmin, async (req, res) => {
    await deActivateMany(Governorate, req, res);
  }); // PATCH /api/sources/deActivate-many/:id
// Route for fetching all governorates and creating a new one
router
  .route("/")
  .get(authenticateToken, isUser, governorateController.getAllGovernorates) // GET /api/governorates
  .post(authenticateToken, isAdmin, governorateController.createGovernorate); // POST /api/governorates

// Route for fetching, updating, and deleting a specific governorate
router
  .route("/:id")
  .get(authenticateToken, isUser, governorateController.getGovernorateById) // GET /api/governorates/:id
  .patch(authenticateToken, isAdmin, governorateController.updateGovernorate); // PATCH /api/governorates/:id
router
  .route("/deActivate/:id")
  .patch(
    authenticateToken,
    isAdmin,
    governorateController.deactivateGovernorate
  );
module.exports = router;
