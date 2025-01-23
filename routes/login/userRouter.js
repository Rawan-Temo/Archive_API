const express = require("express");
const router = express.Router();
const { search, autocomplete } = require("../../utils/serach");
const User = require("../../models/login/user");
const userController = require("../../controllers/login/userController");
router.route("/search").post(async (req, res) => {
  await search(User, ["username"], "sectionId", req, res);
});
router.route("/autoComplete").post(async (req, res) => {
  await autocomplete(User, ["username"], req, res);
});

//
router.route("/login").post(userController.login); ///api/users/login
router.route("/profile").get(userController.userProfile);

router.route("/").get(userController.allUsers).post(userController.createUser);

router.route("/:id").get(userController.userById);
router.route("/deActivate/:id").patch(userController.deactivateUser);
module.exports = router;
