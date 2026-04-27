const mongoose = require("mongoose");

const EmployeeSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.objectId, ref: "User", required: true },
  departmentId: { type: mongoose.Schema.Types.objectId, ref: " Department" },
  jobTitle: { type: String },
  salary: { Number },
  hireDate: { Date },
  phone: { type: String },
  address: { type: String },
  status: {
    type: String,
    enum: ["active", "inactive"],
    default: "active",
  },
});

module.export = mongoose.module("Employee", EmployeeSchema);
