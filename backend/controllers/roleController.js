const roleModel = require("../models/RoleSchema");

// create Role
const createRole = async (req, res) => {
  try {
    const { roleName, permissions } = req.body;

    if (!roleName) {
      return res.status(400).json({
        success: false,
        message: "Role name is required",
      });
    }

     if (!Array.isArray(permissions)) {
      return res.status(400).json({
        success: false,
        message: "permissions must be an array",
      });
    }

    const newRole = new roleModel({
      roleName,
      permissions,
    });

    const result = await newRole.save();
    return res.status(201).json({
      success: true,
      message: "Role created successfully!",
      data: result,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

module.exports = { createRole };
