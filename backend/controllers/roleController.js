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



// GET ALL
const getRoles = async (req, res) => {
  try {
    const roles = await roleModel.find();

    return res.status(200).json({
      success: true,
      message: "Roles fetched successfully",
      data: roles,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// GET BY ID
const getRoleById = async (req, res) => {
  try {
    const role = await roleModel.findById(req.params.id);

    if (!role) {
      return res.status(404).json({
        success: false,
        message: "Role not found",
      });
    }

    return res.json({
      success: true,
      data: role,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// UPDATE
const updateRole = async (req, res) => {
  try {
    const updated = await roleModel.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true }
    );

    return res.json({
      success: true,
      message: "Role updated",
      data: updated,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// DELETE
const deleteRole = async (req, res) => {
  try {
    await roleModel.findByIdAndDelete(req.params.id);

    return res.json({
      success: true,
      message: "Role deleted",
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// ADD PERMISSION
const addPermission = async (req, res) => {
  try {
    const { permission } = req.body;

    const role = await roleModel.findById(req.params.id);

    role.permissions.push(permission);
    await role.save();

    return res.json({
      success: true,
      message: "Permission added",
      data: role,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// REMOVE PERMISSION
const removePermission = async (req, res) => {
  try {
    const role = await roleModel.findById(req.params.id);

    role.permissions = role.permissions.filter(
      (p) => p !== req.params.permission
    );

    await role.save();

    return res.json({
      success: true,
      message: "Permission removed",
      data: role,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

module.exports = {
  createRole,
  getRoles,
  getRoleById,
  updateRole,
  deleteRole,
  addPermission,
  removePermission,
};
