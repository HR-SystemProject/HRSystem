const userModel = require("../models/UserSchema");
const roleModel = require("../models/RoleSchema");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");

// Create user - Signup
const createUser = async (req, res) => {
  try {
    const { name, email, password, role, profileImage } = req.body;

    if (!name || !email || !password) {
      return res.status(400).json({
        success: false,
        message: "Missing data",
      });
    }

    if (password.length < 6) {
      return res.status(400).json({
        success: false,
        message: "Password must be at least 6 characters",
      });
    }

    const emailRegex = /^\S+@\S+\.\S+$/;
    if (!emailRegex.test(email)) {
      return res.status(400).json({
        success: false,
        message: "Invalid email format",
      });
    }

    const existingEmail = await userModel.findOne({ email });

    if (existingEmail) {
      return res.status(400).json({
        success: false,
        message: "Email already exists",
      });
    }

    const userRole = await roleModel.findOne({ roleName: "user" });

    const newUser = new userModel({
      name,
      email,
      password,
      role: userRole._id,
      profileImage: "/image.png",
    });

    const result = await newUser.save();
    await result.populate("role");

    return res.status(201).json({
      success: true,
      message: "User created successfully!",
      data: result,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// Login
const login = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({
        success: false,
        message: "Email and password are required",
      });
    }

    const user = await userModel.findOne({ email }).populate("role");

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    if (user.isActive === false) {
      return res.status(403).json({
        success: false,
        message: "Account is inactive. Contact admin.",
      });
    }

    const test = await bcrypt.hash("123456", 10);

    const cleanHash = user.password.trim();

    const isMatch = await bcrypt.compare(password, cleanHash);

    if (!isMatch) {
      return res.status(400).json({
        success: false,
        message: "Invalid password or email",
      });
    }

    const token = jwt.sign(
      {
        userId: user._id,
        role: user.role.roleName,
      },
      process.env.JWT_SECRET,
      { expiresIn: "24h" },
    );

    return res.status(200).json({
      success: true,
      message: "Login successful",
      token,
      user,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// Update /:id/profile
const updateProfile = async (req, res) => {
  try {
    const { name, profileImage } = req.body;
    const userIdFromToken = req.user.userId;
    const userIdFromParams = req.params.id;

    if (userIdFromToken !== userIdFromParams) {
      return res.status(403).json({
        success: false,
        message: "Forbidden",
      });
    }

    const updatedUser = await userModel
      .findByIdAndUpdate(
        userIdFromParams,
        {
          ...(name && { name }),
          ...(profileImage && { profileImage }),
        },
        { new: true },
      )
      .populate("role");

    if (!updatedUser) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    return res.status(200).json({
      success: true,
      message: "Profile updated",
      data: updatedUser,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

//update /role/:id
const updateUserRole = async (req, res) => {
  try {
    const userId = req.params.id;
    const { role } = req.body;

    const userRole = req.user.role;

    if (userRole !== "admin" && userRole !== "hr") {
      return res.status(403).json({
        success: false,
        message: "Forbidden",
      });
    }

    const user = await userModel
      .findByIdAndUpdate(userId, { role }, { new: true })
      .populate("role");

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    return res.json({
      success: true,
      message: "Role updated successfully",
      data: user,
    });
  } catch (err) {
    return res.status(500).json({
      success: false,
      message: err.message,
    });
  }
};

// CHANGE PASSWORD
const changePassword = async (req, res) => {
  try {
    const userId = req.user.userId;
    const { oldPassword, newPassword } = req.body;

    console.log("old password", oldPassword);
    console.log("new password", newPassword);

    // 1. validate FIRST
    if (!oldPassword || !newPassword) {
      return res.status(400).json({
        success: false,
        message: "Missing password data",
      });
    }
    console.log("HEADERS:", req.headers["content-type"]);
    console.log("BODY:", req.body);
    console.log("BODY RECEIVED:", req.body);

    const user = await userModel.findById(userId);

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    // 2. compare
    const isMatch = await bcrypt.compare(oldPassword, user.password);

    if (!isMatch) {
      return res.status(400).json({
        success: false,
        message: "Old password is incorrect",
      });
    }

    // 3. update
    user.password = newPassword;
    await user.save();

    return res.status(200).json({
      success: true,
      message: "Password changed successfully",
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// Admin: Get users
const getUsers = async (req, res) => {
  try {
    const userRole = req.user.role;

    if (userRole !== "admin" && userRole !== "hr") {
      return res.status(403).json({
        success: false,
        message: "Forbidden",
      });
    }

    const users = await userModel.find({}).populate("role").select("-password");

    return res.status(200).json({
      success: true,
      message: "Users fetched successfully",
      data: users,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// Admin: Get users/:id
const getUserById = async (req, res) => {
  try {
    const userRole = req.user.role;
    const userId = req.params.id;

    if (userRole !== "admin" && userRole !== "hr") {
      return res.status(403).json({
        success: false,
        message: "Forbidden",
      });
    }

    const user = await userModel.findById(userId).populate("role");

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    return res.status(200).json({
      success: true,
      message: "User fetched successfully",
      data: user,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// Admin: Delete users/:id
const deleteUser = async (req, res) => {
  try {
    const userRole = req.user.role;
    const userId = req.params.id;

    if (userRole !== "admin" && userRole !== "hr") {
      return res.status(403).json({
        success: false,
        message: "Forbidden",
      });
    }
    const user = await userModel.findByIdAndDelete(userId).select("-password");

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    return res.status(200).json({
      success: true,
      message: "User deleted successfully",
      data: user,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// Admin: update user information
const updateUser = async (req, res) => {
  try {
    const userRole = req.user.role;

    if (userRole !== "admin" && userRole !== "hr") {
      return res.status(403).json({
        success: false,
        message: "Forbidden",
      });
    }

    const userId = req.params.id;
    const { name, email, role, isActive, profileImage } = req.body;

    const updatedUser = await userModel
      .findByIdAndUpdate(
        userId,
        {
          ...(name && { name }),
          ...(email && { email }),
          ...(role && { role }),
          ...(typeof isActive !== "undefined" && { isActive }),
          ...(profileImage && { profileImage }),
        },
        { new: true },
      )
      .populate("role")
      .select("-password");

    if (!updatedUser) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    return res.status(200).json({
      success: true,
      message: "User updated successfully",
      data: updatedUser,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

module.exports = {
  createUser,
  login,
  updateProfile,
  changePassword,
  getUsers,
  getUserById,
  deleteUser,
  updateUser,
  updateUserRole,
};
