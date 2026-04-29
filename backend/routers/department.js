const express = require("express");
const departmentRouter = express.Router();

const {
  getDepartments,
  getDepartmentsById,
  createDepartments,
  updateDepartments,
  deleteDepartment,
} = require("../controllers/departmentControllers");

const authorize = require("../middleware/Authorization");
const auth = require("../middleware/Authentication");

// get all Departments
departmentRouter.get("/", auth, authorize("hr","admin"), getDepartments);

// get Departments/:id
departmentRouter.get("/:id", auth, authorize("hr","admin"), getDepartmentsById);

// create Department
departmentRouter.post("/", auth, authorize("admin"), createDepartments);

// update Department
departmentRouter.put("/:id", auth, authorize("admin"), updateDepartments);

//delete Department
departmentRouter.delete("/:id", auth, authorize("admin"), deleteDepartment);

module.exports = departmentRouter;
