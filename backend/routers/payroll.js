const express = require("express");
const payrollRouter = express.Router();

const {
  // getMyPayroll,
  getEmployeePayroll,
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
payrollRouter.get("/", auth, authorize(["admin", "hr"]), getPayrolls);

// Get payroll/employee/:id
payrollRouter.get(
  "/employee/:id",
  auth,
  authorize(["admin", "hr"]),
  getByEmployee,
);

// Get payroll/my
payrollRouter.get("/my", auth, getEmployeePayroll);

// Get payroll/month/:month
payrollRouter.get(
  "/month/:month",
  auth,
  authorize(["admin", "hr"]),
  getByMonth,
);

// Create payroll
payrollRouter.post("/", auth, authorize(["admin", "hr"]), createPayroll);

// Calculate payroll
payrollRouter.post(
  "/calculate",
  auth,
  authorize(["admin", "hr"]),
  calculatePayroll,
);

// update payroll/:id/status
payrollRouter.patch(
  "/:id/status",
  auth,
  authorize(["admin", "hr"]),
  updateStatus,
);

// update payroll/:id
payrollRouter.put("/:id", auth, authorize(["admin", "hr"]), updatePayroll);

module.exports = payrollRouter;
