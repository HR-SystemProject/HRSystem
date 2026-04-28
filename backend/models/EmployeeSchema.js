const mongoose = require("mongoose");

const EmployeeSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    departmentId: { type: mongoose.Schema.Types.ObjectId, ref: "Department" },
    jobTitle: { type: String },
    salary: { type: Number },
    hireDate: { type: Date },
    phone: { type: String },
    address: { type: String },
    status: {
      type: String,
      enum: ["active", "inactive"],
      default: "active",
    },
  },
  { timestamps: true },
);

module.exports = mongoose.model("Employee", EmployeeSchema);
