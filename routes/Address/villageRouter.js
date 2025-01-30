const express = require("express");
const router = express.Router();
const villageController = require("../../controllers/Address/villageController");
const { deActivateMany } = require("../../utils/deActivateMany");
const Village = require("../../models/Address/village");
const { search, autocomplete } = require("../../utils/serach");
const {
  authenticateToken,
  isAdmin,
  isUser,
} = require("../../middlewares/authMiddleware");
//SEARCH

router.route("/search").post(authenticateToken, isUser, async (req, res) => {
  await search(Village, ["name"], "city", req, res);
});
router
  .route("/autoComplete")
  .post(authenticateToken, isUser, async (req, res) => {
    await autocomplete(Village, ["name"], req, res);
  });

//
router
  .route("/deActivate-many")
  .patch(authenticateToken, isAdmin, async (req, res) => {
    await deActivateMany(Village, req, res);
  }); // PATCH /api/sources/deActivate-many/:id
// Route for fetching all villages and creating a new village
router
  .route("/")
  .get(authenticateToken, isUser, villageController.getAllVillages) // GET /api/villages
  .post(authenticateToken, isAdmin, villageController.createVillage); // POST /api/villages

// Route for fetching, updating, and deleting a specific village
router
  .route("/:id")
  .get(authenticateToken, isUser, villageController.getVillageById) // GET /api/villages/:id
  .patch(authenticateToken, isAdmin, villageController.updateVillage); // PATCH /api/villages/:id

// Route for deactivating a village (also removes it from the region's villages array)
router
  .route("/deActivate/:id")
  .patch(authenticateToken, isAdmin, villageController.deactivateVillage); // PATCH /api/villages/deactivate/:id

module.exports = router;
