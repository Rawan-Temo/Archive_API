const express = require("express");
const router = express.Router();
const countryController = require("../../controllers/Address/countryController");

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
