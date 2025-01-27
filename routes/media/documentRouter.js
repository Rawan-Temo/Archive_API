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
  .get(authenticateToken, documentController.allDocuments)
  .post(
    authenticateToken,
    documentController.uploadDocuments,
    documentController.handleDocuments
  )
  .patch(authenticateToken, documentController.deleteDocuments);
router
  .route("/:id")
  .patch(
    authenticateToken,
    documentController.uploadDocuments,
    documentController.updateDocument
  );

//Media
module.exports = router;
