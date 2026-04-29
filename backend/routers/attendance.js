const express = require("express");
const attendanceRouter = express.Router();

const {
  getTodayAttendance,
  getAttendance,
  getEmployeeAttendance,
  getMonthlyAttendance,
  getMonthlyAttendanceReport,
  checkIn,
  checkout,
} = require("../controllers/attendanceController");

const authorize = require("../middleware/Authorization");
const auth = require("../middleware/Authentication");

// get attendance/today
attendanceRouter.get(
  "/today",
  auth,
  authorize("hr, admin"),
  getTodayAttendance,
);

// get Attendance
attendanceRouter.get("/", auth, authorize("hr , admin"), getAttendance);

// get attendance/employee/:id
attendanceRouter.get(
  "/employee/:id",
  auth,
  authorize("admin, hr"),
  getEmployeeAttendance,
);

// get Attendance/month/:month "for each employee"
attendanceRouter.get("/month/:month", auth, getMonthlyAttendance);

// get Attendance/monthlyReport/:month "for Hr ans admin"
attendanceRouter.get(
  "/monthlyReport/:month",
  auth,
  authorize("hr , admin"),
  getMonthlyAttendanceReport,
);

// CheckIn
attendanceRouter.post("/checkIn", auth, checkIn);

// Checkout
attendanceRouter.post("/checkout", auth, checkout);

module.exports = attendanceRouter;
