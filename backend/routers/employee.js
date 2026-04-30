const express = require("express");
const employeeRouter = express.Router();

const {
  createEmployee,
  getEmployees,
  getEmployeeById,
  updateEmployee,
  deleteEmployee,
} = require("../controllers/employeeController");

const auth = require("../middleware/Authentication");
const authorize = require("../middleware/Authorization");

// get employees
employeeRouter.get("/", auth, authorize(["admin", "hr"]), getEmployees);

// get employees/ID
employeeRouter.get("/:id", auth, authorize(["admin", "hr"]), getEmployeeById);

// Create employee
employeeRouter.post("/", auth, authorize(["admin", "hr"]), createEmployee);

// Update employees/:id
employeeRouter.put("/:id", auth, authorize(["admin", "hr"]), updateEmployee);

// Delete employees/:id
employeeRouter.delete("/:id", auth, authorize(["admin", "hr"]), deleteEmployee);

module.exports = employeeRouter;
