const express = require("express");
const router = express.Router();

const User = require("../../models/login/user");
const userController = require("../../controllers/login/userController");
router.route("/search").post(async (req, res) => {
  await search(
    User,
    ["username"],
    [{ path: "sectionId", select: "name" }],
    req,
    res
  );
});
router.route("/autoComplete").post(async (req, res) => {
  await autocomplete(User, ["username"], req, res);
});

//
router.route("/login").post(userController.login); ///api/users/login
router.route("/profile").get(userController.userProfile);

router.route("/deActivate-many").patch(async (req, res) => {
  await deActivateMany(User, req, res);
}); // PATCH /api/sources/deActivate-many/:id

router.route("/").get(userController.allUsers).post(userController.createUser);

router
  .route("/:id")
  .get(userController.userById)
  .patch(userController.updateUser);
router.route("deActivate").patch(userController.deactivateUser);
module.exports = router;
