const express = require("express");
const router = express.Router();
const regionController = require("../../controllers/Address/regionController");
const { deActivateMany } = require("../../utils/deActivateMany");
const Region = require("../../models/Address/region");
const {
  authenticateToken,
  isAdmin,
  isUser,
} = require("../../middlewares/authMiddleware");
const { autocomplete, search } = require("../../utils/serach");
//

//SEARCH

router.route("/search").post(authenticateToken, isUser, async (req, res) => {
  await search(Region, ["name"], "city", req, res);
});
router
  .route("/autoComplete")
  .post(authenticateToken, isUser, async (req, res) => {
    await autocomplete(Region, ["name"], req, res);
  });
//SEARCH
//

router
  .route("/deActivate-many")
  .patch(authenticateToken, isAdmin, async (req, res) => {
    await deActivateMany(Region, req, res);
  }); // PATCH /api/sources/deActivate-many/:id
// Route for fetching all regions and creating a new region
router
  .route("/")
  .get(authenticateToken,isUser, regionController.getAllRegions) // GET /api/regions
  .post(authenticateToken, isAdmin, regionController.createRegion); // POST /api/regions

// Route for fetching, updating, and deleting a specific region
router
  .route("/:id")
  .get(authenticateToken, isUser ,regionController.getRegionById) // GET /api/regions/:id
  .patch(authenticateToken, isAdmin, regionController.updateRegion); // PATCH /api/regions/:id

// Route for deactivating a region (also removes it from the city's regions array)
router
  .route("/deActivate/:id")
  .patch(authenticateToken, isAdmin, regionController.deactivateRegion); // PATCH /api/regions/deactivate/:id

module.exports = router;
