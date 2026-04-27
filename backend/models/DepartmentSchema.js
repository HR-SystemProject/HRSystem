const mongoose = require("mongoose");

const DepartmentSchema = new mongoose.Schema({
  name: { type: String, required: true },
  description: { type: String },

  managerId: { type: mongoose.Schema.Types.ObjectId, ref: "Employee" },
  employees: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Employee",
    },
  ],
});

module.exports = mongoose.model("Department", DepartmentSchema);
