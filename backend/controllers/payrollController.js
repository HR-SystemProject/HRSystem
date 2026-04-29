const payrollModel = require("../models/PayrollSchema");
const employeeModel = require("../models/EmployeeSchema");


// CREATE PAYROLL

const createPayroll = async (req, res) => {
  try {
    const {
      employeeId,
      month,
      baseSalary,
      bonus,
      deductions,
      paymentDate,
    } = req.body;

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
      baseSalary + (bonus || 0) - (deductions || 0);

    const newPayroll = new payrollModel({
      employeeId,
      month,
      baseSalary,
      bonus,
      deductions,
      netSalary,
      paymentDate,
      status: "pending",
    });

    const result = await newPayroll.save();

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


// GET ALL

const getPayrolls = async (req, res) => {
  try {
    const payrolls = await payrollModel
      .find()
      .populate("employeeId");

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


// UPDATE PAYROLL

const updatePayroll = async (req, res) => {
  try {
    const { baseSalary, bonus, deductions } = req.body;

    if (baseSalary) {
      req.body.netSalary =
        baseSalary + (bonus || 0) - (deductions || 0);
    }

    const updated = await payrollModel.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true }
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
      { new: true }
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

    const netSalary =
      baseSalary + (bonus || 0) - (deductions || 0);

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


// GET BY EMPLOYEE

const getByEmployee = async (req, res) => {
  try {
    // حماية: user يشوف حاله فقط
    if (
      req.token.role !== "admin" &&
      req.token.role !== "hr" &&
      req.token.userId !== req.params.id
    ) {
      return res.status(403).json({
        success: false,
        message: "Forbidden",
      });
    }

    const data = await payrollModel
      .find({ employeeId: req.params.id })
      .populate("employeeId");

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
  createPayroll,
  getPayrolls,
  updatePayroll,
  updateStatus,
  calculatePayroll,
  getByEmployee,
  getByMonth,
};