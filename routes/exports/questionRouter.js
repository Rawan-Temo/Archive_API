const express = require("express");
const router = express.Router();
const questionController = require("../../controllers/exports/questionController");
const {
  authenticateToken,
  isAdmin,
  isUser,
} = require("../../middlewares/authMiddleware");

// Get all questions and create new question
router
  .route("/")
  .get(authenticateToken, isUser, questionController.getAllQuestions)
  .post(authenticateToken, isUser, questionController.createQuestion);

// Get, update, deactivate by ID
router
  .route("/:id")
  .get(authenticateToken, isUser, questionController.getQuestionById)
  .patch(authenticateToken, isUser, questionController.updateQuestion)
  .delete(authenticateToken, isUser, questionController.deleteQuestion);

module.exports = router;
