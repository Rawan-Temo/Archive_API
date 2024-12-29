const express = require("express");
const router = express.Router();
const audioController = require("../../controllers/media/audioController");

//Media
router
  .route("/")
  .get(audioController.allAudios)
  .post(audioController.uploadAudios, audioController.handleAudios)
  .delete(audioController.deleteAudios);
router
  .route("/:id")
  .patch(audioController.uploadAudios, audioController.updateAudio);

//Media
module.exports = router;
