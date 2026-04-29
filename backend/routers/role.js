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

// get roles
roleRouter.get("/", auth, authorize("admin"), getRoles);

// get roles/:id
roleRouter.get("/:id", auth, authorize("admin"), getRoleById);

// create roles
roleRouter.post("/", auth, authorize("admin"), createRole);

// Update roles/:id
roleRouter.put("/:id", auth, authorize("admin"), updateRole);

// Delete roles/:id
roleRouter.delete("/:id", auth, authorize("admin"), deleteRole);

// Add Permissions /:id/permissions
roleRouter.post("/:id/permissions", auth, authorize("admin"), addPermission);

// Remove Permissions /:id/permissions/:permission
roleRouter.delete(
  "/:id/permissions/:permission",
  auth,
  authorize("admin"),
  removePermission,
);

module.exports = roleRouter;
