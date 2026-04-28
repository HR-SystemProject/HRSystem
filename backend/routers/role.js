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

// create user
roleRouter.post("/", createRole)
router.get("/", getRoles);
router.get("/:id", getRoleById);
router.put("/:id", updateRole);
router.delete("/:id", deleteRole);

router.post("/:id/permissions", addPermission);
router.delete("/:id/permissions/:permission", removePermission);


module.exports = roleRouter;








