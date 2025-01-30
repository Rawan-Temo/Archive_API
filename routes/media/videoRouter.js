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
  .get(authenticateToken, isUser, videoController.allVideos)
  .post(
    authenticateToken,
    isUser,
    videoController.uploadVideos,
    videoController.handleVideos
  )
  .patch(authenticateToken, isUser, videoController.deleteVideos);
router
  .route("/:id")
  .patch(
    authenticateToken,
    isUser,
    videoController.uploadVideos,
    videoController.updateVideo
  );

//Media
module.exports = router;
