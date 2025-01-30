const express = require("express");
const router = express.Router();
const audioController = require("../../controllers/media/audioController");
const {
  authenticateToken,
  isAdmin,
  isUser,
} = require("../../middlewares/authMiddleware");
//Media
router
  .route("/")
  .get(authenticateToken, isUser, audioController.allAudios)
  .post(
    authenticateToken,
    isUser,
    audioController.uploadAudios,
    audioController.handleAudios
  )
  .patch(authenticateToken, isUser, audioController.deleteAudios);
router
  .route("/:id")
  .patch(
    authenticateToken,
    isUser,
    audioController.uploadAudios,
    audioController.updateAudio
  );

//Media
module.exports = router;
