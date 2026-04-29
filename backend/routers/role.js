const express = require("express");
const roleRouter = express.Router();

const {
  createRole,
  getRoles,
  getRoleById,
  updateRole,
  deleteRole,
  addPermission,
  removePermission,
} = require("../controllers/roleController");

const authorize = require("../middleware/Authorization");
const auth = require("../middleware/Authentication");

// create Role
roleRouter.post("/", createRole);

// Get Role
roleRouter.get("/", getRoles);

// Get Role/:id
roleRouter.get("/:id", getRoleById);

// Update Role/:id
roleRouter.put("/:id", updateRole);

// Delete Role/:id
roleRouter.delete("/:id", deleteRole);

// Add Permissions /:id/permissions
roleRouter.post("/:id/permissions", addPermission);

// Remove Permissions /:id/permissions/:permission
roleRouter.delete("/:id/permissions/:permission", removePermission);

module.exports = roleRouter;
