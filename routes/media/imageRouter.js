const express = require("express");
const router = express.Router();
const imageController = require("../../controllers/media/imageController");

//Media
router
  .route("/")
  .get(imageController.allImages)
  .post(imageController.uploadImages, imageController.handleImages)
  .patch(imageController.deleteImages);
router
  .route("/:id")
  .patch(imageController.uploadImages, imageController.updateImage);

//Media
module.exports = router;
