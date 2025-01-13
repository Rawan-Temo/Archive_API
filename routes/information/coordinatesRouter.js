const express = require("express");
const router = express.Router();
const coordinatesController = require("../../controllers/information/coordinatesController");
const { deActivateMany } = require("../../utils/deActivateMany");
const { search, autocomplete } = require("../../utils/serach");
const Coordinate = require("../../models/information/coordinate");
//SEARCH

router.route("/search").post(async (req, res) => {
  await search(
    Coordinate,
    ["coordinates"],
    [
      { path: "sectionId", select: "name" },
      { path: "cityId", select: "name" },
      { path: "countryId", select: "name" },
      { path: "governmentId", select: "name" },
      { path: "regionId", select: "name" },
      { path: "streetId", select: "name" },
      { path: "villageId", select: "name" },
      { path: "sources", select: "source_name" },
    ],
    req,
    res
  );
});
router.route("/autoComplete").post(async (req, res) => {
  await autocomplete(Coordinate, ["coordinates"], req, res);
});

//

router.route("/deActivate-many").patch(async (req, res) => {
  await deActivateMany(Coordinate, req, res);
}); // PATCH /api/v1/sources/deActivate-many/:id
// Routes for getting all Coordinates and creating a new Coordinates
router
  .route("/")
  .get(coordinatesController.allCoordinates) // Get all Coordinates
  .post(coordinatesController.addCoordinates); // Create a new Coordinates

// Routes for specific Coordinates by ID
router
  .route("/:id")
  .get(coordinatesController.getCoordinatesById) // Get a Coordinates by ID
  .patch(coordinatesController.updateCoordinates); // Update a Coordinates by ID

// Route for deactivating a Coordinates
router
  .route("/deActivate/:id")
  .patch(coordinatesController.deactivateCoordinates);

module.exports = router;
