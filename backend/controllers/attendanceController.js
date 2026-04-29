const mongoose = require("mongoose");
const attendanceModel = require("../models/attendanceSchema");

// get Employee Attendance/:id
const getEmployeeAttendance = async (req, res) => {
  try {
    const employeeId = req.params.id;

    const data = await attendanceModel.find({
      employeeId: new mongoose.Types.ObjectId(employeeId),
    });

    let totalHours = 0;
    let absentDays = 0;

    const formatted = data.map((item) => {
      totalHours += item.workingHours || 0;

      if (item.status === "absent") {
        absentDays++;
      }

      let workingTime = null;

      if (item.checkIn && item.checkOut) {
        const diff = item.checkOut - item.checkIn;

        const hours = Math.floor(diff / (1000 * 60 * 60));
        const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));

        workingTime = `${hours}h ${minutes}m`;
      }

      return {
        date: item.date,
        checkIn: item.checkIn,
        checkOut: item.checkOut,
        workingTime,
        status: item.status,
      };
    });

    return res.status(200).json({
      success: true,
      message: "Employee full attendance report",
      data: {
        totalHours,
        absentDays,
        records: formatted,
      },
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

const checkIn = async (req, res) => {
  try {
    const employeeId = req.user.userId;

    const startOfDay = new Date();
    startOfDay.setHours(0, 0, 0, 0);

    const endOfDay = new Date();
    endOfDay.setHours(23, 59, 59, 999);

    const alreadyCheckedIn = await attendanceModel.findOne({
      employeeId,
      date: {
        $gte: startOfDay,
        $lte: endOfDay,
      },
    });

    if (alreadyCheckedIn) {
      return res.status(400).json({
        success: false,
        message: "You already checked in today",
      });
    }

    const now = new Date();
    const currentHour = now.getHours();

    let status = "present";

    if (currentHour > 9) {
      status = "late";
    }

    const attendance = new attendanceModel({
      employeeId,
      checkIn: now,
      date: now,
      status,
    });

    const result = await attendance.save();

    return res.status(201).json({
      success: true,
      message:
        status === "late" ? "Checked in late" : "Checked in successfully",
      data: result,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// Checkout
const checkout = async (req, res) => {
  try {
    const employeeId = req.user.userId;

    const attendance = await attendanceModel
      .findOne({
        employeeId,
        checkOut: null,
        date: {
          $gte: new Date().setHours(0, 0, 0, 0),
        },
      })
      .sort({ createdAt: -1 });

    if (!attendance || attendance.checkOut) {
      return res.status(400).json({
        success: false,
        message: "No active check-in found",
      });
    }

    const checkOutTime = new Date();

    const diff = checkOutTime - attendance.checkIn;

    const hours = Math.floor(diff / (1000 * 60 * 60));
    const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));

    const workingTime = `${hours}h ${minutes}m`;

    attendance.checkOut = checkOutTime;
    attendance.workingHours = diff / (1000 * 60 * 60);
    attendance.markModified("workingHours");

    const result = await attendance.save();

    //  ماتنسي .populate() for employee name
    return res.status(200).json({
      success: true,
      message: "Checked out successfully",
      data: {
        ...result._doc,
        workingTime,
      },
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

module.exports = { getEmployeeAttendance, checkIn, checkout };
