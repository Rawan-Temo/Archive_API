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

router.route("/search").post(authenticateToken, isUser, async (req, res) => {
  await search(Event, ["name"], "", req, res);
});
router
  .route("/autoComplete")
  .post(authenticateToken, isUser, async (req, res) => {
    await autocomplete(Event, ["name"], req, res);
  });

//
router
  .route("/deActivate-many")
  .patch(authenticateToken, isAdmin, async (req, res) => {
    await deActivateMany(Event, req, res);
  }); // PATCH /api/sources/deActivate-many/:id
// Route for fetching all events and creating a new event
router
  .route("/")
  .get(authenticateToken, isUser, eventController.getAllEvents) // GET /api/events
  .post(authenticateToken, isAdmin, eventController.createEvent); // POST /api/events

// Route for fetching, updating, and deactivating a specific event by ID
router
  .route("/:id")
  .get(authenticateToken, isUser, eventController.getEventById) // GET /api/events/:id
  .patch(authenticateToken, isAdmin, eventController.updateEvent); // PATCH /api/events/:id

router
  .route("/deActivate/:id")
  .patch(authenticateToken, isAdmin, eventController.deactivateEvent); // DELETE /api/events/:id
module.exports = router;
