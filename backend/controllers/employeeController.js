const employeeModel = require("../models/EmployeeSchema");
const userModel = require("../models/UserSchema");
const departmentModel = require("../models/DepartmentSchema");


// CREATE EMPLOYEE (Admin & HR)

const createEmployee = async (req, res) => {
  try {
    const {
      userId,
      departmentId,
      jobTitle,
      salary,
      hireDate,
      phone,
      address,
      status,
    } = req.body;

    if (!userId || !departmentId || !jobTitle) {
      return res.status(400).json({
        success: false,
        message: "Missing required fields",
      });
    }

    const user = await userModel.findById(userId);
    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    const department = await departmentModel.findById(departmentId);
    if (!department) {
      return res.status(404).json({
        success: false,
        message: "Department not found",
      });
    }

    const newEmployee = new employeeModel({
      userId,
      departmentId,
      jobTitle,
      salary,
      hireDate,
      phone,
      address,
      status,
    });

    const result = await newEmployee.save();

    return res.status(201).json({
      success: true,
      message: "Employee created successfully",
      data: result,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};


// GET ALL EMPLOYEES

const getEmployees = async (req, res) => {
  try {
    const employees = await employeeModel
      .find()
      .populate("userId")
      .populate("departmentId");

    return res.json({
      success: true,
      data: employees,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};


// GET EMPLOYEE BY ID

const getEmployeeById = async (req, res) => {
  try {
    const employee = await employeeModel
      .findById(req.params.id)
      .populate("userId")
      .populate("departmentId");

    if (!employee) {
      return res.status(404).json({
        success: false,
        message: "Employee not found",
      });
    }

    return res.json({
      success: true,
      data: employee,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};


// UPDATE EMPLOYEE

const updateEmployee = async (req, res) => {
  try {
    const updated = await employeeModel.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true }
    );

    if (!updated) {
      return res.status(404).json({
        success: false,
        message: "Employee not found",
      });
    }

    return res.json({
      success: true,
      message: "Employee updated",
      data: updated,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};


// DELETE EMPLOYEE

const deleteEmployee = async (req, res) => {
  try {
    const employee = await employeeModel.findByIdAndDelete(req.params.id);

    if (!employee) {
      return res.status(404).json({
        success: false,
        message: "Employee not found",
      });
    }

    return res.json({
      success: true,
      message: "Employee deleted",
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

module.exports = {
  createEmployee,
  getEmployees,
  getEmployeeById,
  updateEmployee,
  deleteEmployee,
};