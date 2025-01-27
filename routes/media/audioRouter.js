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
  .get(authenticateToken, audioController.allAudios)
  .post(
    authenticateToken,
    audioController.uploadAudios,
    audioController.handleAudios
  )
  .patch(authenticateToken, audioController.deleteAudios);
router
  .route("/:id")
  .patch(
    authenticateToken,
    audioController.uploadAudios,
    audioController.updateAudio
  );

//Media
module.exports = router;
