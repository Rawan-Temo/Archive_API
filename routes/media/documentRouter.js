const express = require("express");
const router = express.Router();
const documentController = require("../../controllers/media/documentController");

//Media
router
  .route("/")
  .get(documentController.allDocuments)
  .post(documentController.uploadDocuments, documentController.handleDocuments)
  .delete(documentController.deleteDocuments);
router
  .route("/:id")
  .patch(documentController.uploadDocuments, documentController.updateDocument);

//Media
module.exports = router;
