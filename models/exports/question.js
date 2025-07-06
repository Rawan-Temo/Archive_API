const mongoose = require("mongoose");

const questionSchema = new mongoose.Schema(
  {
    informationId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Information",
      required: true,
      
    },
    question: {
      type: String,
      required: true,
    },
    answer: {
      type: String,
      required: true,
    },
  },
  {
    timestamps: true,
  }
);
const Question = mongoose.model("Question", questionSchema);
module.exports = Question;
