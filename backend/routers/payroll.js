const express = require("express");
const payrollRouter = express.Router();

const {
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
payrollRouter.put("/", getPayrolls);

// Get payroll/employee/:id
payrollRouter.get("/employee/:id", getByEmployee);

// Get payroll/month/:month
payrollRouter.get("/month/:month", getByMonth);

// Create payroll
payrollRouter.post("/", createPayroll);

// Calculate payroll
payrollRouter.post("/calculate", calculatePayroll);

// update payroll/:id/status
payrollRouter.patch("/:id/status", updateStatus);

// update payroll/:id
payrollRouter.put("/:id", updatePayroll);

module.exports = payrollRouter;
