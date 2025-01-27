const express = require("express");
const router = express.Router();
const eventController = require("../../controllers/details/eventController");
const Event = require("../../models/details/event");
const { deActivateMany } = require("../../utils/deActivateMany");
const { search, autocomplete } = require("../../utils/serach");
const {
  authenticateToken,
  isAdmin,
  isUser,
} = require("../../middlewares/authMiddleware");
//SEARCH

router.route("/search").post(authenticateToken, async (req, res) => {
  await search(Event, ["name"], "", req, res);
});
router.route("/autoComplete").post(authenticateToken, async (req, res) => {
  await autocomplete(Event, ["name"], req, res);
});

//
router.route("/deActivate-many").patch(authenticateToken, async (req, res) => {
  await deActivateMany(Event, req, res);
}); // PATCH /api/sources/deActivate-many/:id
// Route for fetching all events and creating a new event
router
  .route("/")
  .get(authenticateToken, eventController.getAllEvents) // GET /api/events
  .post(authenticateToken, eventController.createEvent); // POST /api/events

// Route for fetching, updating, and deactivating a specific event by ID
router
  .route("/:id")
  .get(authenticateToken, eventController.getEventById) // GET /api/events/:id
  .patch(authenticateToken, eventController.updateEvent); // PATCH /api/events/:id

router
  .route("/deActivate/:id")
  .patch(authenticateToken, eventController.deactivateEvent); // DELETE /api/events/:id
module.exports = router;
