const Question = require("../../models/exports/question");
const APIFeatures = require("../../utils/apiFeatures");
const { search } = require("../../utils/serach");
const Export = require("../../models/exports/export"); // import your Export model
// Get all questions
const getAllQuestions = async (req, res) => {
  if (req.query.search) {
    await search(Question, ["text"], "informationId", req, res);
    return;
  }
  try {
    const features = new APIFeatures(
      Question.find().populate("informationId").lean(),
      req.query
    )
      .filter()
      .sort()
      .limitFields()
      .paginate();

    const queryObj = { ...req.query };
    const excludedFields = ["page", "sort", "limit", "fields"];
    excludedFields.forEach((el) => delete queryObj[el]);

    let queryStr = JSON.stringify(queryObj);
    queryStr = queryStr.replace(/\b(gte|gt|lte|lt)\b/g, (match) => `$${match}`);
    const parsedQuery = JSON.parse(queryStr);
    const [questions, total] = await Promise.all([
      features.query,
      Question.countDocuments(parsedQuery),
    ]);

    res.status(200).json({
      status: "success",
      results: questions.length,
      total,
      data: questions,
    });
  } catch (error) {
    res.status(500).json({
      status: "fail",
      message: error.message,
    });
  }
};

// Create new question
const createQuestion = async (req, res) => {
  try {
    const newQuestion = await Question.create(req.body);
    res.status(201).json({
      status: "success",
      data: newQuestion,
    });
  } catch (error) {
    res.status(400).json({
      status: "fail",
      message: error.message,
    });
  }
};

// Get question by ID
const getQuestionById = async (req, res) => {
  try {
    const question = await Question.findById(req.params.id)
      .populate("informationId")
      .lean();
    if (!question) {
      return res
        .status(404)
        .json({ status: "fail", message: "Question not found" });
    }
    res.status(200).json({
      status: "success",
      data: question,
    });
  } catch (error) {
    res.status(500).json({
      status: "fail",
      message: error.message,
    });
  }
};

// Update question
const updateQuestion = async (req, res) => {
  try {
    const updated = await Question.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true,
    });
    if (!updated) {
      return res
        .status(404)
        .json({ status: "fail", message: "Question not found" });
    }
    res.status(200).json({
      status: "success",
      data: updated,
    });
  } catch (error) {
    res.status(500).json({
      status: "fail",
      message: error.message,
    });
  }
};

const deleteQuestion = async (req, res) => {
  try {
    const questionId = req.params.id;

    // Delete the question
    const deleted = await Question.findByIdAndDelete(questionId);
    if (!deleted) {
      return res
        .status(404)
        .json({ status: "fail", message: "Question not found" });
    }

    // Remove the deleted question's ID from any Export documents' questions array
    await Export.updateMany(
      { questions: questionId },
      { $pull: { questions: questionId } }
    );

    res.status(200).json({
      status: "success",
      message: "Question deleted successfully and references cleaned",
    });
  } catch (error) {
    res.status(500).json({
      status: "fail",
      message: error.message,
    });
  }
};

module.exports = {
  getAllQuestions,
  createQuestion,
  getQuestionById,
  updateQuestion,
  deleteQuestion,
};
