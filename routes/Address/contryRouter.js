const express = require("express");
const router = express.Router();
const countryController = require("../../controllers/Address/countryController");
const { deActivateMany } = require("../../utils/deActivateMany");
const Country = require("../../models/Address/country");
//
router.route("/deActivate-many").patch(async (req, res) => {
  await deActivateMany(Country, req, res);
}); // PATCH /api/v1/sources/deActivate-many/:id
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
