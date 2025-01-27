const express = require("express");
const router = express.Router();
const cityController = require("../../controllers/Address/cityController");
const { deActivateMany } = require("../../utils/deActivateMany");
const City = require("../../models/Address/city");
const { autocomplete, search } = require("../../utils/serach");
//
const {
  authenticateToken,
  isAdmin,
  isUser,
} = require("../../middlewares/authMiddleware");
//SEARCH

router.route("/search").post(authenticateToken, async (req, res) => {
  await search(City, ["name"], "country", req, res);
});
router.route("/autoComplete").post(authenticateToken, async (req, res) => {
  await autocomplete(City, ["name"], req, res);
});
//SEARCH

router.route("/deActivate-many").patch(authenticateToken, async (req, res) => {
  await deActivateMany(City, req, res);
}); // PATCH /api/sources/deActivate-many/:id

// Route for fetching all cities and creating a new one
router
  .route("/")
  .get(authenticateToken, cityController.getAllCities) // GET /api/cities
  .post(authenticateToken, cityController.createCity); // POST /api/cities

// Route for fetching, updating, and deleting a specific city
router
  .route("/:id")
  .get(authenticateToken, cityController.getCityById) // GET /api/cities/:id
  .patch(authenticateToken, cityController.updateCity); // PATCH /api/cities/:id

// Route to deactivate a specific city
router
  .route("/deActivate/:id")
  .patch(authenticateToken, cityController.deactivateCity); // PATCH /api/cities/deActivate/:id

module.exports = router;
