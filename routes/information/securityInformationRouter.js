const express = require("express");
const router = express.Router();
const securityInformationController = require("../../controllers/information/securityInformationController");
const { deActivateMany } = require("../../utils/deActivateMany");
const { search, autocomplete } = require("../../utils/serach");
const SecurityInformation = require("../../models/information/securityInformation");
//SEARCH

router.route("/search").post(async (req, res) => {
  await search(
    SecurityInformation,
    ["subject"],
    [
      { path: "sectionId", select: "name" }, // Only include `name` from Section
      { path: "cityId", select: "name" },
      { path: "countryId", select: "name" },
      { path: "governmentId", select: "name" },
      { path: "regionId", select: "name" },
      { path: "streetId", select: "name" },
      { path: "villageId", select: "name" },
      { path: "events", select: "name" }, // Only include specific fields
      { path: "parties", select: "name" },
      { path: "sources", select: "source_name" },
      { path: "people", select: "firstName surName" },
    ],
    req,
    res
  );
});
router.route("/autoComplete").post(async (req, res) => {
  await autocomplete(SecurityInformation, ["subject"], req, res);
});

//

router.route("/deActivate-many").patch(async (req, res) => {
  await deActivateMany(SecurityInformation, req, res);
}); // PATCH /api/Information/deActivate-many/:id

// Routes for getting all information and creating a new person
router
  .route("/")
  .get(securityInformationController.allInformation) // Get all information
  .post(securityInformationController.createInformation); // Create a new Information

// Routes for specific Information by ID
router
  .route("/:id")
  .get(securityInformationController.getInformationById) // Get a Information by ID
  .patch(securityInformationController.updateInformation); // Update a Information by ID

// Route for deactivating a Information
router
  .route("/deActivate/:id")
  .patch(securityInformationController.deactivateInformation);

module.exports = router;
