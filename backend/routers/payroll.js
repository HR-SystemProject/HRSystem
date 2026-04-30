const express = require("express");
const payrollRouter = express.Router();

const {
  // getMyPayroll,
  createPayroll,
  getPayrolls,
  updatePayroll,
  updateStatus,
  calculatePayroll,
  getByEmployee,
  getByMonth,
} = require("../controllers/payrollController");

const authorize = require("../middleware/Authorization");
const auth = require("../middleware/Authentication");

// Get payroll
payrollRouter.get("/",auth,authorize(["admin","hr"]), getPayrolls);

// Get payroll/employee/:id
payrollRouter.get("/employee/:id",auth, authorize(["admin","hr"]), getByEmployee);

// // Get /payroll/my
// payrollRouter.get("/my",auth,getByEmployee);

// Get payroll/month/:month
payrollRouter.get("/month/:month", getByMonth);

// Create payroll
payrollRouter.post("/", auth, authorize(["admin","hr"]),createPayroll);

// Calculate payroll
payrollRouter.post("/calculate", calculatePayroll);

// update payroll/:id/status
payrollRouter.patch("/:id/status", updateStatus);

// update payroll/:id
payrollRouter.put("/:id", updatePayroll);

module.exports = payrollRouter;
