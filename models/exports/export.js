const mongoose = require("mongoose");
const exportSchema = new mongoose.Schema({
  code: {
    type: String,
    required: true,
    unique: true,
  },
  details: {
    type: String,
  },
  questions: [
  
  ],
});

const Export = mongoose.model("Export", exportSchema);
module.exports = Export;
