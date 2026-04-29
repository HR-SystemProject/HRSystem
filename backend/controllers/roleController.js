const mongoose = require("mongoose");
const roleModel = require("../models/RoleSchema");

// get roles
const getRoles = async (req, res) => {
  try {
    const userRole = req.user.role;

    if (userRole !== "admin") {
      return res.status(403).json({
        success: false,
        message: "Forbidden",
      });
    }
    const roles = await roleModel.find({});

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

// get roles/:id
const getRoleById = async (req, res) => {
  try {
    const roleId = req.params.id;
    const userRole = req.user.role;

    if (userRole !== "admin") {
      return res.status(403).json({
        success: false,
        message: "Forbidden",
      });
    }

    const role = await roleModel.findById(roleId);

    if (!role) {
      return res.status(404).json({
        success: false,
        message: "Role not found",
      });
    }

    return res.status(200).json({
      success: true,
      message: "Role fetched successfully",
      data: role,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// create roles
const createRole = async (req, res) => {
  try {
    const { roleName, permissions } = req.body;
    const userRole = req.user.role;

    if (userRole !== "admin") {
      return res.status(403).json({
        success: false,
        message: "Forbidden",
      });
    }

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
      message: "Role created successfully",
      data: result,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// Update roles/:id
const updateRole = async (req, res) => {
  try {
    const userRole = req.user.role;
    const roleId = req.params.id;
    const { roleName, permissions } = req.body;

    if (userRole !== "admin") {
      return res.status(403).json({
        success: false,
        message: "Forbidden",
      });
    }

    const updated = await roleModel.findByIdAndUpdate(
      roleId,
      { roleName, permissions },
      { new: true, runValidators: true },
    );

    if (!updated) {
      return res.status(404).json({
        success: false,
        message: "Role not found",
      });
    }

    return res.status(200).json({
      success: true,
      message: "Role updated successfully",
      data: updated,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// Delete roles/:id
const deleteRole = async (req, res) => {
  try {
    const userRole = req.user.role;
    const roleId = req.params.id;

    if (userRole !== "admin") {
      return res.status(403).json({
        success: false,
        message: "Forbidden",
      });
    }

    const deletedRole = await roleModel.findByIdAndDelete(roleId);

    if (!deletedRole) {
      return res.status(404).json({
        success: false,
        message: "Role not found",
      });
    }

    return res.status(200).json({
      success: true,
      message: "Role deleted successfully",
      data: deletedRole,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// Add Permissions /:id/permissions
const addPermission = async (req, res) => {
  try {
    const userRole = req.user.role;
    const { permissions } = req.body;
    const roleId = req.params.id;

    if (userRole !== "admin") {
      return res.status(403).json({
        success: false,
        message: "Forbidden",
      });
    }

    if (!permissions || !Array.isArray(permissions)) {
      return res.status(400).json({
        success: false,
        message: "Permissions must be an array",
      });
    }

    const updatedRole = await roleModel.findByIdAndUpdate(
      roleId,
      {
        $addToSet: {
          permissions: { $each: permissions },
        },
      },
      { new: true },
    );

    if (!updatedRole) {
      return res.status(404).json({
        success: false,
        message: "Role not found",
      });
    }

    return res.status(200).json({
      success: true,
      message: "Permissions added successfully",
      data: updatedRole,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// Remove Permissions /:id/permissions/:permission
const removePermission = async (req, res) => {
  try {
    const userRole = req.user.role;
    const roleId = req.params.id;
    const permission = req.params.permission;

    if (userRole !== "admin") {
      return res.status(403).json({
        success: false,
        message: "Forbidden",
      });
    }

    if (!permission) {
      return res.status(400).json({
        success: false,
        message: "Permission is required",
      });
    }
    const updatedRole = await roleModel.findByIdAndUpdate(
      roleId,
      {
        $pull: {
          permissions: permission,
        },
      },
      { new: true },
    );

    if (!updatedRole) {
      return res.status(404).json({
        success: false,
        message: "Role not found",
      });
    }

    return res.status(200).json({
      success: true,
      message: "Permission removed successfully",
      data: updatedRole,
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
