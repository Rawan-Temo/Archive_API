const express = require("express");
const router = express.Router();
const countryController = require("../../controllers/Address/countryController");
const { deActivateMany } = require("../../utils/deActivateMany");
const Country = require("../../models/Address/country");
const { search, autocomplete } = require("../../utils/serach");
//SEARCH

router.route("/search").post(async (req, res) => {
  await search(Country,["name"], "", req, res);
});
router.route("/autoComplete").post(async (req, res) => {
  await autocomplete(Country, ["name"], req, res);
});
//SEARCH
//
router.route("/deActivate-many").patch(async (req, res) => {
  await deActivateMany(Country, req, res);
}); // PATCH /api/sources/deActivate-many/:id
router
  .route("/")
  .get(countryController.getAllCountries)
  .post(countryController.createCountry);
router
  .route("/:id")
  .get(countryController.getCountryByName)
  .patch(countryController.updateCountry);
router.route("/deActivate/:id").patch(countryController.deActivateCountry);

module.exports = router;
