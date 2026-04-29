const mongoose = require("mongoose");

const RoleSchema = new mongoose.Schema(
  {
    roleName: {
      type: String,
      // enum: ["user", "admin", "hr"],
      required: true,
      unique: true,
    },
    permissions: [{ type: String }],
  },
  { timestamps: true },
);

module.exports = mongoose.model("Role", RoleSchema);
