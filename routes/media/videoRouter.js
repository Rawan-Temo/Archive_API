const express = require("express");
const router = express.Router();
const videoController = require("../../controllers/media/videoController");
const {
  authenticateToken,
  isAdmin,
  isUser,
} = require("../../middlewares/authMiddleware");
//Media
router
  .route("/")
  .get(authenticateToken, videoController.allVideos)
  .post(
    authenticateToken,
    videoController.uploadVideos,
    videoController.handleVideos
  )
  .patch(authenticateToken, videoController.deleteVideos);
router
  .route("/:id")
  .patch(
    authenticateToken,
    videoController.uploadVideos,
    videoController.updateVideo
  );

//Media
module.exports = router;
