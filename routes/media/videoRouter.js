const express = require("express");
const router = express.Router();
const videoController = require("../../controllers/media/videoController");

//Media
router
  .route("/")
  .get(videoController.allVideos)
  .post(videoController.uploadVideos, videoController.handleVideos)
  .patch(videoController.deleteVideos);
router
  .route("/:id")
  .patch(videoController.uploadVideos, videoController.updateVideo);

//Media
module.exports = router;
