const express = require("express");
const userRouter = express.Router();

const {
  createUser,
  login,
  logout,
  updateProfile,
  forgetPassword,
  changePassword,
  getUsers,
  getUserById,
  deleteUser,
} = require("../controllers/userController");

const authorize = require("../middleware/Authorization");
const auth = require("../middleware/Authentication");

// create user
userRouter.post("/signup", createUser);

// Login
userRouter.post("/login", login);

// LOGOUT
userRouter.post("/logout", auth, logout);

// Update /:id/profile
userRouter.put("/:id/profile", auth, updateProfile);

// CHANGE PASSWORD
userRouter.post("/:id/change-password", auth, changePassword);

// FORGET PASSWORD
userRouter.post("/forget-password", forgetPassword);

// ADMIN ROUTES

// Get users
userRouter.get("/", auth, authorize("admin"), getUsers);

// Get users/:id
userRouter.get("/:id", auth, authorize("admin"), getUserById);

// Delete users/:id
userRouter.delete("/:id", auth, authorize("admin"), deleteUser);

module.exports = userRouter;
