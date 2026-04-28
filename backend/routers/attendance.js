const express = require("express");
const attendanceRouter = express.Router();

const { getEmployeeAttendance, checkIn, checkout } = require("../controllers/attendanceController");

const authorize = require("../middleware/Authorization");
const auth = require("../middleware/Authentication");

// get attendance/employee/:id
attendanceRouter.get(
  "/employee/:id",
  auth,
  authorize("admin, hr"),
  getEmployeeAttendance,
);

// CheckIn
attendanceRouter.post("/checkIn", auth, checkIn);

// Checkout
attendanceRouter.post("/checkout", auth, checkout);

module.exports = attendanceRouter;
