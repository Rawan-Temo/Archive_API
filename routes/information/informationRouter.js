const express = require("express");
const router = express.Router();
const InformationController = require("../../controllers/information/informationController");
const { deActivateMany } = require("../../utils/deActivateMany");
const { search, autocomplete } = require("../../utils/serach");
const Information = require("../../models/information/information");
//SEARCH

router.route("/search").post(async (req, res) => {
  await search(
    Information,
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
      { path: "coordinates", select: "coordinates note" },
    ],
    req,
    res
  );
});
router.route("/autoComplete").post(async (req, res) => {
  await autocomplete(Information, ["subject"], req, res);
});

//

router.route("/deActivate-many").patch(async (req, res) => {
  await deActivateMany(Information, req, res);
}); // PATCH /api/Information/deActivate-many/:id

// Routes for getting all information and creating a new person
router
  .route("/")
  .get(InformationController.allInformation) // Get all information
  .post(InformationController.createInformation); // Create a new Information

// Routes for specific Information by ID
router
  .route("/:id")
  .get(InformationController.getInformationById) // Get a Information by ID
  .patch(InformationController.updateInformation); // Update a Information by ID

// Route for deactivating a Information
router
  .route("/deActivate/:id")
  .patch(InformationController.deactivateInformation);

module.exports = router;
