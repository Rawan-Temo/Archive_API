const express = require("express");
const router = express.Router();
const countyController = require("../../controllers/Address/countyController");
const { deActivateMany } = require("../../utils/deActivateMany");
const County = require("../../models/Address/county");
const {
  authenticateToken,
  isAdmin,
  isUser,
} = require("../../middlewares/authMiddleware");
const { search, autocomplete } = require("../../utils/serach");
//SEARCH

router.route("/search").post(authenticateToken, isUser, async (req, res) => {
  await search(County, ["name"], "country", req, res);
});
router
  .route("/autoComplete")
  .post(authenticateToken, isUser, async (req, res) => {
    await autocomplete(County, ["name"], req, res);
  });
//SEARCH
//
router
  .route("/deActivate-many")
  .patch(authenticateToken, isAdmin, async (req, res) => {
    await deActivateMany(County, req, res);
  }); // PATCH /api/sources/deActivate-many/:id
// Route for fetching all governorates and creating a new one
router
  .route("/")
  .get(authenticateToken, isUser, countyController.getAllCounties) // GET /api/counties
  .post(authenticateToken, isAdmin, countyController.createCounty); // POST /api/counties

// Route for fetching, updating, and deleting a specific governorate
router
  .route("/:id")
  .get(authenticateToken, isUser, countyController.getCountyById) // GET /api/counties/:id
  .patch(authenticateToken, isAdmin, countyController.updateCounty); // PATCH /api/counties/:id
router
  .route("/deActivate/:id")
  .patch(
    authenticateToken,
    isAdmin,
    countyController.deactivateCounty
  );
module.exports = router;
