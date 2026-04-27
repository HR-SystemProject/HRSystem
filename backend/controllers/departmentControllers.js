const departmentModel = require("../models/DepartmentSchema");

// get Departments
const getDepartments = async (req, res) => {
  try {
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

// create Departments
const createDepartment = async (req, res) => {
  try {
    const { name, description } = req.body;

    if (!name) {
      return res.status(400).json({
        success: false,
        message: "Department Name is Required",
      });
    }

    const newDepartment = new departmentModel({
      name,
      description,
    });

    const result = await newDepartment.save();
    return res.status(201).json({
      success: true,
      message: "Department created successfully!",
      data: result,
    });

  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

module.exports = { getDepartments, createDepartment };
