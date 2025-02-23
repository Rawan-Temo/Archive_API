const express = require("express");
const router = express.Router();
const imageController = require("../../controllers/media/imageController");
const {
  authenticateToken,
  isAdmin,
  isUser,
} = require("../../middlewares/authMiddleware");
const searchImages = require("../../utils/searchImages");
//Media
router.route("/searchImages").post(imageController.uploadImages, searchImages);
//Media
router
  .route("/")
  .get(authenticateToken, isUser, imageController.allImages)
  .post(
    authenticateToken,
    isUser,
    imageController.uploadImages,
    imageController.handleImages
  )
  .patch(authenticateToken, isUser, imageController.deleteImages);
router
  .route("/:id")
  .patch(
    authenticateToken,
    isUser,
    imageController.uploadImages,
    imageController.updateImage
  );

//Media
module.exports = router;
