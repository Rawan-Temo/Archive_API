const express = require("express");
const router = express.Router();
const departmentController = require("../../controllers/details/departmentController");
const Department = require("../../models/details/department");
const { deActivateMany } = require("../../utils/deActivateMany");
const {
  authenticateToken,
  isAdmin,
  isUser,
} = require("../../middlewares/authMiddleware");
//SEARCH

//
router
  .route("/deActivate-many")
  .patch(authenticateToken, isAdmin, async (req, res) => {
    await deActivateMany(Department, req, res);
  }); // PATCH /api/sources/deActivate-many/:id
// Route for fetching all events and creating a new event
router
  .route("/")
  .get(authenticateToken, isUser, departmentController.getAllDepartments) // GET /api/Departments
  .post(authenticateToken, isAdmin, departmentController.createDepartment); // POST /api/Departments

// Route for fetching, updating, and deactivating a specific Department by ID
router
  .route("/:id")
  .get(authenticateToken, isUser, departmentController.getDepartmentById) // GET /api/Departments/:id
  .patch(authenticateToken, isAdmin, departmentController.updateDepartment); // PATCH /api/Departments/:id

router
  .route("/deActivate/:id")
  .patch(authenticateToken, isAdmin, departmentController.deactivateDepartment); // DELETE /api/events/:id
module.exports = router;
