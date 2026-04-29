const express = require("express");
const leaveRequestRouter = express.Router();

const {} = require("../controllers/leaveRequestController");

const authorize = require("../middleware/Authorization");
const auth = require("../middleware/Authentication");

module.exports = leaveRequestRouter;
