const express = require("express");
const userRouter = express.Router();

const {
  createUser,
  login,
  updateProfile,
  changePassword,
  getUsers,
  getUserById,
  deleteUser,
  updateUser,
  updateUserRole,
} = require("../controllers/userController");

const authorize = require("../middleware/Authorization");
const auth = require("../middleware/Authentication");

// create user
userRouter.post("/signup", createUser);

// Login
userRouter.post("/login", login);

// Update /:id/profile
userRouter.put("/:id/profile", auth, updateProfile);

// CHANGE PASSWORD
userRouter.post("/changePassword", auth, changePassword);

// ADMIN ROUTES

// Get users
userRouter.get("/", auth, authorize(["admin", "hr"]), getUsers);

// Get users/:id
userRouter.get("/:id", auth, authorize(["admin", "hr"]), getUserById);

// Delete users/:id
userRouter.delete("/:id", auth, authorize(["admin", "hr"]), deleteUser);

// updateRole
userRouter.put("/role/:id", auth, authorize(["admin"]), updateUserRole);

// Admin: update user information
userRouter.put("/:id", auth, authorize(["admin", "hr"]), updateUser);

module.exports = userRouter;
