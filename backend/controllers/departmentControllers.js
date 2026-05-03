const departmentModel = require("../models/DepartmentSchema");
const employeeModel = require("../models/EmployeeSchema");
const userModel = require("../models/UserSchema");

// get Departments
const getDepartments = async (req, res) => {
  try {
    const userRole = req.user.role;

    console.log(userRole);

    if (userRole !== "admin" && userRole !== "hr") {
      return res.status(403).json({
        success: false,
        message: "Forbidden",
      });
    }

    const departments = await departmentModel.find({});

    if (departments.length === 0) {
      return res.status(404).json({
        success: false,
        message: "No department found",
      });
    }

    return res.status(200).json({
      success: true,
      message: "All Departments",
      data: departments,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// get Departments/:id
const getDepartmentsById = async (req, res) => {
  try {
    const departmentId = req.params.id;
    const userRole = req.user.role;

    if (userRole !== "admin" && userRole !== "hr") {
      return res.status(403).json({
        success: false,
        message: "Forbidden",
      });
    }

    const departments = await departmentModel
      .findById(departmentId)
      .populate("managerId", "name email");

    if (!departments) {
      return res.status(404).json({
        success: false,
        message: "Department not found",
      });
    }

    const employees = await userModel
      .find({ departmentId })
      .select("name email");

    return res.status(200).json({
      success: true,
      message: "Department found",
      data: {
        ...departments.toObject(),
        employees: employees,
      },
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// create Departments
const createDepartments = async (req, res) => {
  try {
    const { name, description } = req.body;
    const userRole = req.user.role;

    if (userRole !== "admin") {
      return res.status(403).json({
        success: false,
        message: "Forbidden",
      });
    }

    if (!name) {
      return res.status(400).json({
        success: false,
        message: "Department Name is Required",
      });
    }

    const newDepartment = new departmentModel({
      name,
      description,
      managerId: req.body.managerId,
    });

    if (!req.body.managerId) {
      return res.status(400).json({
        success: false,
        message: "Manager is required",
      });
    }

    const result = await newDepartment.save();

    const populatedResult = await departmentModel
      .findById(result._id)
      .populate("managerId", "name email");

    return res.status(201).json({
      success: true,
      message: "Department created successfully!",
      data: populatedResult,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// update Departments
const updateDepartments = async (req, res) => {
  try {
    const departmentId = req.params.id;
    const { name, description } = req.body;

    const updateDepartment = await departmentModel.findByIdAndUpdate(
      departmentId,
      {
        name,
        description,
        managerId: req.body.managerId,
      },
      {
        new: true,
        runValidators: true,
      },
    );

    if (!updateDepartment) {
      return res.status(404).json({
        success: false,
        message: "Department not found",
      });
    }

    await updateDepartment.populate("managerId", "name email");

    return res.status(200).json({
      success: true,
      message: "Department updated successfully!",
      data: updateDepartment,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// Delete Department/:id
const deleteDepartment = async (req, res) => {
  try {
    const userRole = req.user.role;
    const departmentId = req.params.id;

    if (userRole !== "admin") {
      return res.status(403).json({
        success: false,
        message: "Forbidden",
      });
    }

    const result = await departmentModel
      .findByIdAndDelete(departmentId)
      .populate("managerId", "name email");

    if (!result) {
      return res.status(404).json({
        success: false,
        message: "Department not found",
      });
    }

    return res.status(200).json({
      success: true,
      message: "Department deleted successfully!",
      data: result,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

module.exports = {
  getDepartments,
  getDepartmentsById,
  createDepartments,
  updateDepartments,
  deleteDepartment,
};
