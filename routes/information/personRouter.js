const express = require("express");
const router = express.Router();
const personController = require("../../controllers/information/personController");
const { deActivateMany } = require("../../utils/deActivateMany");
const Person = require("../../models/information/person");
const { search, autocomplete } = require("../../utils/serach");
//SEARCH

router.route("/search").get(async (req, res) => {
  await search(Person, ["firstName", "surName", "fatherName"],"cityId countryId governmentId regionId streetId villageId", req, res);
});
router.route("/autoComplete").get(async (req, res) => {
  await autocomplete(Person, ["firstName", "surName", "fatherName"], req, res);
});

//

router.route("/deActivate-many").patch(async (req, res) => {
  await deActivateMany(Person, req, res);
}); // PATCH /api/v1/sources/deActivate-many/:id
// Routes for getting all people and creating a new person
router.route("/Jobs").get(personController.allJobs); // Get all people
router
  .route("/")
  .get(personController.allPeople) // Get all people
  .post(personController.upload.single("image"), personController.createPerson); // Create a new person

// Routes for specific person by ID
router
  .route("/:id")
  .get(personController.getPersonById) // Get a person by ID
  .patch(
    personController.upload.single("image"),
    personController.updatePerson
  ); // Update a person by ID

// Route for deactivating a person
router.route("/deActivate/:id").patch(personController.deactivatePerson);

module.exports = router;
