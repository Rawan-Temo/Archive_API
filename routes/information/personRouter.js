const express = require("express");
const router = express.Router();
const personController = require("../../controllers/information/personController");
const { deActivateMany } = require("../../utils/deActivateMany");
const Person = require("../../models/information/person");
const { search, autocomplete } = require("../../utils/serach");
//SEARCH

router.route("/search").post(async (req, res) => {
  await search(
    Person,
    ["firstName", "surName", "fatherName"],
    [
      { path: "sectionId", select: "name" },
      { path: "cityId", select: "name" },
      { path: "countryId", select: "name" },
      { path: "governmentId", select: "name" },
      { path: "regionId", select: "name" },
      { path: "streetId", select: "name" },
      { path: "villageId", select: "name" },{ path: "sources", select: "source_name" },
    ],
    req,
    res
  );
});
router.route("/autoComplete").post(async (req, res) => {
  await autocomplete(Person, ["firstName", "surName", "fatherName"], req, res);
});

//

router.route("/deActivate-many").patch(async (req, res) => {
  await deActivateMany(Person, req, res);
}); // PATCH /api/sources/deActivate-many/:id
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
