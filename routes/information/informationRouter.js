const express = require("express");
const router = express.Router();
const InformationController = require("../../controllers/information/informationController");
const { deActivateMany } = require("../../utils/deActivateMany");
const { search, autocomplete } = require("../../utils/serach");
const Information = require("../../models/information/information");
const {
  authenticateToken,
  isAdmin,
  isUser,
} = require("../../middlewares/authMiddleware");
//SEARCH

router.route("/search").post(authenticateToken, async (req, res) => {
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
router.route("/autoComplete").post(authenticateToken, async (req, res) => {
  await autocomplete(Information, ["subject"], req, res);
});

//

router.route("/deActivate-many").patch(authenticateToken, async (req, res) => {
  await deActivateMany(Information, req, res);
}); // PATCH /api/Information/deActivate-many/:id

// Routes for getting all information and creating a new person
router
  .route("/")
  .get(authenticateToken, InformationController.allInformation) // Get all information
  .post(authenticateToken, InformationController.createInformation); // Create a new Information

// Routes for specific Information by ID
router
  .route("/:id")
  .get(authenticateToken, InformationController.getInformationById) // Get a Information by ID
  .patch(authenticateToken, InformationController.updateInformation); // Update a Information by ID

// Route for deactivating a Information
router
  .route("/deActivate/:id")
  .patch(authenticateToken, InformationController.deactivateInformation);

module.exports = router;
