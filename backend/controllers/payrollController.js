const mongoose = require("mongoose");
const payrollModel = require("../models/payrollSchema");
const employeeModel = require("../models/EmployeeSchema");

// Get payroll
const getPayrolls = async (req, res) => {
  try {
    const userRole = req.user.role;

    if (!["admin", "hr"].includes(userRole)) {
      return res.status(403).json({
        success: false,
        message: "Forbidden",
      });
    }

    const payrolls = await payrollModel.find({}).populate({
      path: "employeeId",
      populate: [
        {
          path: "userId",
          select: "name email",
        },
        {
          path: "departmentId",
          select: "name",
        },
      ],
    });

    return res.json({
      success: true,
      data: payrolls,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// Get payroll/employee/:id
const getByEmployee = async (req, res) => {
  try {
    const userRole = req.user.role;
    const employeeId = req.params.id;

    if (!["admin", "hr"].includes(userRole)) {
      return res.status(403).json({
        success: false,
        message: "Forbidden",
      });
    }

    const data = await payrollModel.find({ employeeId }).populate({
      path: "employeeId",
      populate: [
        {
          path: "userId",
          select: "name email",
        },
        {
          path: "departmentId",
          select: "name",
        },
      ],
    });

    return res.status(200).json({
      success: true,
      data,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// get payroll/my
const getEmployeePayroll = async (req, res) => {
  try {
    const userId = req.user.userId;

    const employee = await employeeModel.findOne({ userId });

    if (!employee) {
      return res.status(404).json({
        success: false,
        message: "Employee not found",
      });
    }

    const payroll = await payrollModel
      .find({
        employeeId: employee._id,
      })
      .populate({
        path: "employeeId",
        populate: [
          {
            path: "userId",
            select: "name email",
          },
          {
            path: "departmentId",
            select: "name",
          },
        ],
      });

    if (!payroll.length) {
      return res.status(200).json({
        success: true,
        message: "No payroll records found",
        data: [],
      });
    }

    res.status(200).json({
      success: true,
      message: "Payroll fetched successfully",
      data: payroll,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// Create payroll
const createPayroll = async (req, res) => {
  try {
    const userRole = req.user.role;

    if (!["admin", "hr"].includes(userRole)) {
      return res.status(403).json({
        success: false,
        message: "Forbidden",
      });
    }

    const { employeeId, month, bonus, deductions, paymentDate } = req.body;

    // required fields
    if (!employeeId || !month) {
      return res.status(400).json({
        success: false,
        message: "Missing required fields",
      });
    }

    // month format validation
    const regex = /^\d{4}-\d{2}$/;
    if (!regex.test(month)) {
      return res.status(400).json({
        success: false,
        message: "Month must be YYYY-MM",
      });
    }

    // normalize month
    const normalizedMonth = month.trim().slice(0, 7);

    // check employee exists
    const employee = await employeeModel.findById(employeeId);

    if (!employee) {
      return res.status(404).json({
        success: false,
        message: "Employee not found",
      });
    }

    const baseSalary = employee.salary;

    // prevent duplicate payroll
    const exists = await payrollModel.findOne({
      employeeId,
      month: normalizedMonth,
    });

    if (exists) {
      return res.status(400).json({
        success: false,
        message: `Payroll already exists for ${normalizedMonth}`,
      });
    }

    // calculate net salary
    const netSalary =
      Number(baseSalary || 0) +
      Number(bonus || 0) -
      Number(deductions || 0);

    // create payroll
    const newPayroll = new payrollModel({
      employeeId,
      month: normalizedMonth,
      baseSalary,
      bonus: Number(bonus || 0),
      deductions: Number(deductions || 0),
      netSalary,
      paymentDate: paymentDate || null,
      status: "pending",
    });

    const result = await newPayroll.save();

    await result.populate({
      path: "employeeId",
      populate: [
        { path: "userId", select: "name email" },
        { path: "departmentId", select: "name" },
      ],
    });

    return res.status(201).json({
      success: true,
      message: "Payroll created successfully",
      data: result,
    });

  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// Update payroll/:id
const updatePayroll = async (req, res) => {
  try {
    const userRole = req.user.role;

    if (!["admin", "hr"].includes(userRole)) {
      return res.status(403).json({
        success: false,
        message: "Forbidden",
      });
    }

    const { bonus, deductions } = req.body;

    const payroll = await payrollModel.findById(req.params.id);

    if (!payroll) {
      return res.status(404).json({
        success: false,
        message: "Payroll not found",
      });
    }

    if (payroll.status === "paid") {
      return res.status(400).json({
        success: false,
        message: "Paid payroll cannot be updated",
      });
    }

    const employee = await employeeModel.findById(payroll.employeeId);

    if (!employee) {
      return res.status(404).json({
        success: false,
        message: "Employee not found",
      });
    }

    const baseSalary = employee.salary;
    const newBonus = Number(bonus ?? payroll.bonus);
    const newDeductions = Number(deductions ?? payroll.deductions);

    if (isNaN(newBonus) || isNaN(newDeductions)) {
      return res.status(400).json({
        success: false,
        message: "Invalid numeric values",
      });
    }

    const netSalary = baseSalary + newBonus - newDeductions;

    const updated = await payrollModel
      .findByIdAndUpdate(
        req.params.id,
        {
          bonus: newBonus,
          deductions: newDeductions,
          baseSalary,
          netSalary,
        },
        { new: true },
      )
      .populate({
        path: "employeeId",
        populate: [
          { path: "userId", select: "name email" },
          { path: "departmentId", select: "name" },
        ],
      });

    return res.status(200).json({
      success: true,
      message: "Payroll updated successfully",
      data: updated,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// Update status
const updateStatus = async (req, res) => {
  try {
    const userRole = req.user.role;
    const { status } = req.body;

    if (!["admin", "hr"].includes(userRole)) {
      return res.status(403).json({
        success: false,
        message: "Forbidden",
      });
    }

    const allowed = ["paid", "pending"];

    if (!allowed.includes(status)) {
      return res.status(400).json({
        success: false,
        message: "Invalid status",
      });
    }
    const payroll = await payrollModel.findById(req.params.id);

    if (!payroll) {
      return res.status(404).json({
        success: false,
        message: "Payroll not found",
      });
    }

    if (payroll.status === status) {
      return res.status(400).json({
        success: false,
        message: "Status already set",
      });
    }
    const updated = await payrollModel
      .findByIdAndUpdate(req.params.id, { status }, { new: true })
      .populate({
        path: "employeeId",
        populate: [
          { path: "userId", select: "name email" },
          { path: "departmentId", select: "name" },
        ],
      });

    return res.status(200).json({
      success: true,
      message: "Status updated successfully",
      data: updated,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// calculate payroll
const calculatePayroll = async (req, res) => {
  try {
    const userRole = req.user.role;

    if (!["admin", "hr"].includes(userRole)) {
      return res.status(403).json({
        success: false,
        message: "Forbidden",
      });
    }

    let { baseSalary, bonus, deductions } = req.body;

    if (baseSalary === undefined || baseSalary === null || baseSalary === "") {
      return res.status(400).json({
        success: false,
        message: "Base salary is required",
      });
    }

    baseSalary = Number(baseSalary);
    bonus = Number(bonus || 0);
    deductions = Number(deductions || 0);

    if (isNaN(baseSalary) || isNaN(bonus) || isNaN(deductions)) {
      return res.status(400).json({
        success: false,
        message: "All values must be numbers",
      });
    }

    if (baseSalary < 0 || bonus < 0 || deductions < 0) {
      return res.status(400).json({
        success: false,
        message: "Values cannot be negative",
      });
    }

    const netSalary = Number((baseSalary + bonus - deductions).toFixed(2));

    return res.status(200).json({
      success: true,
      message: "Payroll calculated successfully",
      data: {
        baseSalary,
        bonus,
        deductions,
        netSalary,
      },
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// Get payroll/:month
const getByMonth = async (req, res) => {
  try {
    const userRole = req.user.role;
    const month = req.params.month;

    if (!["admin", "hr"].includes(userRole)) {
      return res.status(403).json({
        success: false,
        message: "Forbidden",
      });
    }

    const regex = /^\d{4}-\d{2}$/;
    if (!regex.test(month)) {
      return res.status(400).json({
        success: false,
        message: "Month must be YYYY-MM",
      });
    }

    const data = await payrollModel
      .find({
        month,
      })
      .populate({
        path: "employeeId",
        populate: [
          {
            path: "userId",
            select: "name email",
          },
          {
            path: "departmentId",
            select: "name",
          },
        ],
      });

    if (!data.length) {
      return res.status(200).json({
        success: true,
        message: "No payroll records found",
        data: [],
      });
    }

    return res.status(200).json({
      success: true,
      message: "Payroll fetched successfully",
      data,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

module.exports = {
  getEmployeePayroll,
  createPayroll,
  getPayrolls,
  updatePayroll,
  updateStatus,
  calculatePayroll,
  getByEmployee,
  getByMonth,
};
