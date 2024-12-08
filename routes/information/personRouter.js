const express = require("express");
const router = express.Router();
const personController = require("../../controllers/information/personController");
router.route("/").get(personController.allPeople).post();
router.route("/:id").get().patch();
router.route("/deActivate/:id").patch();

module.exports = router;
