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

router.route("/search").post(authenticateToken, isUser, async (req, res) => {
  await search(Country, ["name"], "", req, res);
});
router
  .route("/autoComplete")
  .post(authenticateToken, isUser, async (req, res) => {
    await autocomplete(Country, ["name"], req, res);
  });
//SEARCH
//
router
  .route("/deActivate-many")
  .patch(authenticateToken, isAdmin, async (req, res) => {
    await deActivateMany(Country, req, res);
  }); // PATCH /api/sources/deActivate-many/:id
router
  .route("/country-tree")
  .get(authenticateToken, isUser, countryController.getAllCountriesWithDetails);
router
  .route("/")
  .get(authenticateToken, isUser, countryController.getAllCountries)
  .post(authenticateToken, isAdmin, countryController.createCountry);
router
  .route("/:id")
  .get(authenticateToken, isUser, countryController.getCountryByName)
  .patch(authenticateToken, isAdmin, countryController.updateCountry);
router
  .route("/deActivate/:id")
  .patch(authenticateToken, isAdmin, countryController.deActivateCountry);

module.exports = router;
