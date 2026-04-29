const express = require("express");
const payrollRouter = express.Router();

const {} = require("../controllers/payrollController");

const authorize = require("../middleware/Authorization");
const auth = require("../middleware/Authentication");

module.exports = payrollRouter;
