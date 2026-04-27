const express = require("express");
const roleRouter = express.Router();

const {createRole} = require("../controllers/roleController");

const authorize = require("../middleware/Authorization");
const auth = require("../middleware/Authentication");

// create user
roleRouter.post("/", createRole)

module.exports = roleRouter;
