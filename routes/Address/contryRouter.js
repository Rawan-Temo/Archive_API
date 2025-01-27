const express = require("express");
const router = express.Router();
const countryController = require("../../controllers/Address/countryController");
const { deActivateMany } = require("../../utils/deActivateMany");
const Country = require("../../models/Address/country");
const { search, autocomplete } = require("../../utils/serach");
const {
  authenticateToken,
  isAdmin,
  isUser,
} = require("../../middlewares/authMiddleware");
//SEARCH

router.route("/search").post(authenticateToken, async (req, res) => {
  await search(Country, ["name"], "", req, res);
});
router.route("/autoComplete").post(authenticateToken, async (req, res) => {
  await autocomplete(Country, ["name"], req, res);
});
//SEARCH
//
router.route("/deActivate-many").patch(authenticateToken, async (req, res) => {
  await deActivateMany(Country, req, res);
}); // PATCH /api/sources/deActivate-many/:id
router
  .route("/country-tree")
  .get(authenticateToken, countryController.getAllCountriesWithDetails);
router
  .route("/")
  .get(authenticateToken, countryController.getAllCountries)
  .post(authenticateToken, countryController.createCountry);
router
  .route("/:id")
  .get(authenticateToken, countryController.getCountryByName)
  .patch(authenticateToken, countryController.updateCountry);
router
  .route("/deActivate/:id")
  .patch(authenticateToken, countryController.deActivateCountry);

module.exports = router;
