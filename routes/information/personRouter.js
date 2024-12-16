const express = require("express");
const router = express.Router();
const personController = require("../../controllers/information/personController");

// Routes for getting all people and creating a new person
router.route("/Jobs").get(personController.allJobs); // Get all people
router
  .route("/")
  .get(personController.allPeople) // Get all people
  .post(
    personController.upload.single("image"),
    personController.createPerson
  ); // Create a new person

// Routes for specific person by ID
router
  .route("/:id")
  .get(personController.getPersonById) // Get a person by ID
  .patch(personController.upload.single("image") ,personController.updatePerson); // Update a person by ID

// Route for deactivating a person
router.route("/deActivate/:id").patch(personController.deactivatePerson);

module.exports = router;
