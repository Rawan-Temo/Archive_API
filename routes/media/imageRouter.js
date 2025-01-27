const express = require("express");
const router = express.Router();
const imageController = require("../../controllers/media/imageController");
const {
  authenticateToken,
  isAdmin,
  isUser,
} = require("../../middlewares/authMiddleware");
//Media
router
  .route("/")
  .get(authenticateToken, imageController.allImages)
  .post(
    authenticateToken,
    imageController.uploadImages,
    imageController.handleImages
  )
  .patch(authenticateToken, imageController.deleteImages);
router
  .route("/:id")
  .patch(
    authenticateToken,
    imageController.uploadImages,
    imageController.updateImage
  );

//Media
module.exports = router;
