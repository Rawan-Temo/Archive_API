const express = require("express");
const router = express.Router();
const { search, autocomplete } = require("../../utils/serach");
const User = require("../../models/login/user");
const userController = require("../../controllers/login/userController");
const {
  authenticateToken,
  isAdmin,
  isUser,
} = require("../../middlewares/authMiddleware");
router.route("/search").post(authenticateToken, isAdmin, async (req, res) => {
  await search(User, ["username"], "sectionId", req, res);
});
router
  .route("/autoComplete")
  .post(authenticateToken, isAdmin, async (req, res) => {
    await autocomplete(User, ["username"], req, res);
  });

router
  .route("/deActivate-many")
  .patch(authenticateToken, isAdmin, async (req, res) => {
    await deActivateMany(User, req, res);
  }); // PATCH /api/sources/deActivate-many/:id
//
router.route("/login").post(userController.login); ///api/users/login
router.route("/profile").get(authenticateToken, userController.userProfile);

router
  .route("/")
  .get(authenticateToken, isAdmin, userController.allUsers)
  .post(authenticateToken, isAdmin, userController.createUser);

router.route("/:id").get(authenticateToken, isAdmin, userController.userById);
router
  .route("/deActivate/:id")
  .patch(authenticateToken, isAdmin, userController.deactivateUser);
module.exports = router;
