const mongoose = require("mongoose");
const exportSchema = new mongoose.Schema(
  {
    code: {
      type: String,
      required: true,
    },
    details: {
      type: String,
    },
    questions: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Question",
      },
    ],
    expirationDate: {
      type: Date,
      required: true,
      // validate: {
      //   validator: function (v) {
      //     return v > Date.now();
      //   },
      //   message: "Expiration date must be in the future.",
      // },
    },
    active: {
      type: Boolean,
      default: true,
    },
  },
  { timestamps: true }
);
exportSchema.index(
  { code: 1 },
  { unique: true, partialFilterExpression: { active: true } }
);
const Export = mongoose.model("Export", exportSchema);
module.exports = Export;
