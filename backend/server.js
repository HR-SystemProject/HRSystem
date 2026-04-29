const express = require("express");
const cors = require("cors");
const dotenv = require("dotenv");

require("dotenv").config();

const app = express();

require("./models/db");

// Middleware
app.use(cors());
app.use(express.json());

const PORT = process.env.PORT || 5000;

// User Router
const userRouter = require("./routers/user");
app.use("/users", userRouter);

// Role Router
const roleRouter = require("./routers/role");
app.use("/roles", roleRouter);

// Department Router
const departmentRouter = require("./routers/employeeRoutes");
app.use("/employee", departmentRouter);

// employee Router
const employeeRoutes = require("./routers/employeeRoutes");
app.use("/employee", employeeRoutes);

// Attendance Router
const attendanceRouter = require("./routers/attendance");
app.use("/attendance", attendanceRouter);
// Payroll Router
const payrollRouter = require("./routers/payroll");
app.use("/payroll", payrollRouter);

app.listen(PORT, () => {
  console.log(`Example application listening at http://localhost:${PORT}`);
});
