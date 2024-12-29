const express = require("express");
const router = express.Router();
const eventController = require("../../controllers/details/eventController");
const Event = require("../../models/details/event");
const { deActivateMany } = require("../../utils/deActivateMany");
const { search, autocomplete } = require("../../utils/serach");
//SEARCH

router.route("/search").get(async (req, res) => {
  await search(Event, ["name"],"", req, res);
});
router.route("/autoComplete").get(async (req, res) => {
  await autocomplete(Event, ["name"], req, res);
});

//
router.route("/deActivate-many").patch(async (req, res) => {
  await deActivateMany(Event, req, res);
}); // PATCH /api/v1/sources/deActivate-many/:id
// Route for fetching all events and creating a new event
router
  .route("/")
  .get(eventController.getAllEvents) // GET /api/v1/events
  .post(eventController.createEvent); // POST /api/v1/events

// Route for fetching, updating, and deactivating a specific event by ID
router
  .route("/:id")
  .get(eventController.getEventById) // GET /api/v1/events/:id
  .patch(eventController.updateEvent); // PATCH /api/v1/events/:id

router.route("/deActivate/:id").patch(eventController.deactivateEvent); // DELETE /api/v1/events/:id
module.exports = router;
