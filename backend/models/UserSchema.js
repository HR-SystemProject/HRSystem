const mongoose = require("mongoose");

const UserSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  roleName: { type: mongoose.Schema.Types.ObjectId, ref: "Role" },
  isActive: { type: Boolean, default: true },
  profileImage: { type: String },
});

module.export = mongoose.model("User", UserSchema);
