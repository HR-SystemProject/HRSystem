const employeeModel = require("../models/EmployeeSchema");
const userModel = require("../models/UserSchema");
const departmentModel = require("../models/DepartmentSchema");

// Get employees
const getEmployees = async (req, res) => {
  try {
    const userRole = req.user.role;

    if (userRole !== "admin" && userRole !== "hr") {
      return res.status(403).json({
        success: false,
        message: "Forbidden",
      });
    }

    const employees = await employeeModel
      .find({})
      .populate("userId", "name email")
      .populate({
        path: "departmentId",
        populate: {
          path: "managerId",
          select: "name email",
        },
      });

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

// Get employee/:id
const getEmployeeById = async (req, res) => {
  try {
    const userRole = req.user.role;

    if (userRole !== "admin" && userRole !== "hr") {
      return res.status(403).json({
        success: false,
        message: "Forbidden",
      });
    }

    const employee = await employeeModel
      .findById(req.params.id)
      .populate("userId", "name email")
      .populate({
        path: "departmentId",
        populate: {
          path: "managerId",
          select: "name email",
        },
      });

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

// Create employee (Admin & HR)
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
    const userRole = req.user.role;

    if (userRole !== "admin" && userRole !== "hr") {
      return res.status(403).json({
        success: false,
        message: "Forbidden",
      });
    }

    if (!userId || !departmentId || !jobTitle) {
      return res.status(400).json({
        success: false,
        message: "Missing data",
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

    const existingEmployee = await employeeModel.findOne({ userId });
    if (existingEmployee) {
      return res.status(400).json({
        success: false,
        message: "Employee already exists for this user",
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
      status: status || "active",
    });

    const result = await newEmployee.save();

    await result.populate("userId", "name email");
    await result.populate("departmentId", "name");

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

// Update employee/:id
const updateEmployee = async (req, res) => {
  try {
    const userRole = req.user.role;

    if (userRole !== "admin" && userRole !== "hr") {
      return res.status(403).json({
        success: false,
        message: "Forbidden",
      });
    }

    const updated = await employeeModel.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true },
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

// Delete employees/:id
const deleteEmployee = async (req, res) => {
  try {
    const userRole = req.user.role;

    if (userRole !== "admin" && userRole !== "hr") {
      return res.status(403).json({
        success: false,
        message: "Forbidden",
      });
    }

    const employee = await employeeModel.findByIdAndDelete(req.params.id);

    if (!employee) {
      return res.status(404).json({
        success: false,
        message: "Employee not found",
      });
    }

    return res.json({
      success: true,
      message: "Employee deleted successfully",
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
