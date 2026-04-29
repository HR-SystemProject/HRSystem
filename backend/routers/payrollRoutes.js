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

const auth = require("../middleware/Authentication");
const authorize = require("../middleware/Authorization");

// Admin & HR
payrollRouter.post("/", auth, authorize("admin", "hr"), createPayroll);
payrollRouter.put("/:id", auth, authorize("admin", "hr"), updatePayroll);
payrollRouter.patch("/:id/status", auth, authorize("admin", "hr"), updateStatus);
payrollRouter.post("/calculate", auth, authorize("admin", "hr"), calculatePayroll);

// GET
payrollRouter.get("/", auth, getPayrolls);
payrollRouter.get("/employee/:id", auth, getByEmployee);
payrollRouter.get("/month/:month", auth, getByMonth);

module.exports = payrollRouter;