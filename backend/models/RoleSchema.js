const mongoose = require("mongoose");

const RoleSchema = new mongoose.Schema({
  rolename: {
    type: String,
    enum: ["user", "admin", "hr"],
    required: true,
    unique: true,
  },
  permissions: { type: [String] },
});

module.export = mongoose.model("Role", RoleSchema);
