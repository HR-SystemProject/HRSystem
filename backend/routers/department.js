const express = require("express");
const departmentRouter = express.Router();

const {getDepartments, createDepartment} = require("../controllers/departmentControllers");

const authorize = require("../middleware/Authorization");
const auth = require("../middleware/Authentication");

// get all Departments
departmentRouter.get("/", getDepartments);

// create Department
departmentRouter.post("/", createDepartment)

module.exports = departmentRouter;
