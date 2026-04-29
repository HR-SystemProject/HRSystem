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


// ADMIN & HR ONLY


// CREATE
employeeRouter.post(
  "/",
  auth,
  authorize("admin", "hr"),
  createEmployee
);

// UPDATE
employeeRouter.put(
  "/:id",
  auth,
  authorize("admin", "hr"),
  updateEmployee
);

// DELETE
employeeRouter.delete(
  "/:id",
  auth,
  authorize("admin", "hr"),
  deleteEmployee
);


// GET (ALL LOGGED USERS)


employeeRouter.get("/", auth, getEmployees);

employeeRouter.get("/:id", auth, getEmployeeById);

module.exports = employeeRouter;