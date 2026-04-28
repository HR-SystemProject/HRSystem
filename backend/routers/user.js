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

// UPDATE PROFILE
userRouter.put("/:id/profile", auth, updateProfile);

// CHANGE PASSWORD
userRouter.post("/:id/change-password", auth, changePassword);

// FORGET PASSWORD
userRouter.post("/forget-password", forgetPassword);

// ADMIN ROUTES

// GET ALL USERS
userRouter.get("/", auth, authorize("admin"), getUsers);

// GET USER BY ID
userRouter.get("/:id", auth, authorize("admin"), getUserById);

// DELETE USER
userRouter.delete("/:id", auth, authorize("admin"), deleteUser);

module.exports = userRouter;
