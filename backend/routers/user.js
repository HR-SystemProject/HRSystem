const express = require("express");
const userRouter = express.Router();

const { createUser, login } = require("../controllers/userController");

const authorize = require("../middleware/Authorization");
const auth = require("../middleware/Authentication");

// create user
userRouter.post("/signup", createUser);

// Login
userRouter.post("/login", login);

module.exports = userRouter;
