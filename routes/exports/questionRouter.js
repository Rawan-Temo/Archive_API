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
  .get(authenticateToken, isAdmin, questionController.getAllQuestions)
  .post(authenticateToken, isAdmin, questionController.createQuestion);

// Get, update, deactivate by ID
router
  .route("/:id")
  .get(authenticateToken, isAdmin, questionController.getQuestionById)
  .patch(authenticateToken, isAdmin, questionController.updateQuestion)
  .delete(authenticateToken, isAdmin, questionController.deleteQuestion);

module.exports = router;
