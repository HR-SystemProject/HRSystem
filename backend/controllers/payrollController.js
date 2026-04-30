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

// // Get /payroll/my
// const getMyPayroll = async (req, res) => {
//   try {
//     const userId = req.user.userId;

//     // const employee = await employeeModel.findOne({ userId });

//     console.log("USER ID:", req.user.userId);

//     const employee = await employeeModel.findOne({ userId: req.user.userId });
//     console.log("EMPLOYEE:", employee);

//     if (!employee) {
//       return res.status(404).json({
//         success: false,
//         message: "Employee not found",
//       });
//     }

//     const data = await payrollModel
//       .find({ employeeId: employee._id })
//       .populate({
//         path: "employeeId",
//         populate: [
//           { path: "userId", select: "name email" },
//           { path: "departmentId", select: "name" },
//         ],
//       });

//     return res.status(200).json({
//       success: true,
//       data,
//     });
//   } catch (error) {
//     return res.status(500).json({
//       success: false,
//       message: error.message,
//     });
//   }
// };

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

    const { employeeId, month, baseSalary, bonus, deductions, paymentDate } =
      req.body;

    if (!employeeId || !month || !baseSalary) {
      return res.status(400).json({
        success: false,
        message: "Missing required fields",
      });
    }

    //month check
    const regex = /^\d{4}-\d{2}$/;
    if (!regex.test(month)) {
      return res.status(400).json({
        success: false,
        message: "Month must be YYYY-MM",
      });
    }

    //employee check
    const employee = await employeeModel.findById(employeeId);
    if (!employee) {
      return res.status(404).json({
        success: false,
        message: "Employee not found",
      });
    }

    //no repeat
    const exists = await payrollModel.findOne({ employeeId, month });
    if (exists) {
      return res.status(400).json({
        success: false,
        message: "Payroll already exists for this month",
      });
    }

    const netSalary =
      Number(baseSalary) + Number(bonus || 0) - Number(deductions || 0);

    const newPayroll = new payrollModel({
      employeeId,
      month,
      baseSalary,
      bonus,
      deductions,
      netSalary,
      paymentDate: paymentDate || null,
      status: "pending",
    });

    const result = await newPayroll.save();
    await result.populate("employeeId", "name email jobTitle");

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

// UPDATE PAYROLL
const updatePayroll = async (req, res) => {
  try {
    const { baseSalary, bonus, deductions } = req.body;

    if (baseSalary) {
      req.body.netSalary = baseSalary + (bonus || 0) - (deductions || 0);
    }

    const updated = await payrollModel.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true },
    );

    if (!updated) {
      return res.status(404).json({
        success: false,
        message: "Payroll not found",
      });
    }

    return res.json({
      success: true,
      message: "Payroll updated",
      data: updated,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// UPDATE STATUS

const updateStatus = async (req, res) => {
  try {
    const { status } = req.body;

    const allowed = ["paid", "pending"];

    if (!allowed.includes(status)) {
      return res.status(400).json({
        success: false,
        message: "Invalid status",
      });
    }

    const updated = await payrollModel.findByIdAndUpdate(
      req.params.id,
      { status },
      { new: true },
    );

    return res.json({
      success: true,
      message: "Status updated",
      data: updated,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// CALCULATE

const calculatePayroll = async (req, res) => {
  try {
    const { baseSalary, bonus, deductions } = req.body;

    const netSalary = baseSalary + (bonus || 0) - (deductions || 0);

    return res.json({
      success: true,
      netSalary,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// GET BY MONTH

const getByMonth = async (req, res) => {
  try {
    const data = await payrollModel.find({
      month: req.params.month,
    });

    return res.json({
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

module.exports = {
  // getMyPayroll,
  createPayroll,
  getPayrolls,
  updatePayroll,
  updateStatus,
  calculatePayroll,
  getByEmployee,
  getByMonth,
};
