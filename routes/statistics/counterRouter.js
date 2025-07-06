const express = require("express");

const router = express.Router();
router.route("/").get((req, res) => {
  res.send("Counter statistics");
});
module.exports = router;
