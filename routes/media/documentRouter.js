const express = require("express");
const router = express.Router();
const documentController = require("../../controllers/media/documentController");
const {
  authenticateToken,
  isAdmin,
  isUser,
} = require("../../middlewares/authMiddleware");
//Media
router
  .route("/")
  .get(authenticateToken, isUser, documentController.allDocuments)
  .post(
    authenticateToken,
    isUser,
    documentController.uploadDocuments,
    documentController.handleDocuments
  )
  .patch(authenticateToken, isUser, documentController.deleteDocuments);
router
  .route("/:id")
  .patch(
    authenticateToken,
    isUser,
    documentController.uploadDocuments,
    documentController.updateDocument
  );

//Media
module.exports = router;
