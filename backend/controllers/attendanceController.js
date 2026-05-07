const mongoose = require("mongoose");
const attendanceModel = require("../models/attendanceSchema");
const employeeModel = require("../models/EmployeeSchema");

// get attendance/today
const getTodayAttendance = async (req, res) => {
  try {
    const startOfDay = new Date();
    startOfDay.setHours(0, 0, 0, 0);

    const endOfDay = new Date();
    endOfDay.setHours(23, 59, 59, 999);

    const data = await attendanceModel
      .find({
        date: {
          $gte: startOfDay,
          $lte: endOfDay,
        },
      })
      .populate("employeeId", "name email")
      .sort({ createdAt: -1 });

    if (!data.length) {
      return res.status(404).json({
        success: false,
        message: "No attendance records for today",
      });
    }

    const formatted = data.map((item) => {
      let workingTime = "Still working";

      if (item.checkIn && item.checkOut) {
        const diff = item.checkOut - item.checkIn;

        const hours = Math.floor(diff / (1000 * 60 * 60));
        const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));

        workingTime = `${hours}h ${minutes}m`;
      }

      return {
        userId: item.employeeId,
        checkIn: item.checkIn,
        checkOut: item.checkOut,
        status: item.status,
        workingTime,
      };
    });

    return res.status(200).json({
      success: true,
      message: "Today's attendance",
      data: formatted,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// get attendance
const getAttendance = async (req, res) => {
  try {
    const data = await attendanceModel
      .find()
      .populate("employeeId", "name email")
      .sort({ createdAt: -1 });

    const formatted = data.map((item) => {
      let workingTime = null;

      if (item.checkIn && item.checkOut) {
        const diff = item.checkOut - item.checkIn;

        const hours = Math.floor(diff / (1000 * 60 * 60));

        const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));

        workingTime = `${hours}h ${minutes}m`;
      }

      return {
        employeeId: item.employeeId,
        date: item.date,
        checkIn: item.checkIn,
        checkOut: item.checkOut || null,
        workingTime: workingTime || "Still working",
        status: item.status,
      };
    });

    return res.status(200).json({
      success: true,
      message: "All attendance records",
      data: formatted,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

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

// get Attendance/month/:month "for each employee"
const getMonthlyAttendance = async (req, res) => {
  try {
    const employeeId = req.user.userId;
    const month = Number(req.params.month);

    const result = await attendanceModel
      .find({
        employeeId,
        $expr: {
          $eq: [{ $month: "$date" }, month],
        },
      })
      .populate("employeeId", "name email");

    let totalHours = 0;
    let absentDays = 0;
    let lateDays = 0;
    let totalMinutes = 0;

    result.forEach((item) => {
      totalMinutes += (item.workingHours || 0) * 60;

      if (item.status === "absent") absentDays++;
      if (item.status === "late") lateDays++;
    });

    const hours = Math.floor(totalMinutes / 60);
    const minutes = Math.floor(totalMinutes % 60);

    const totalTime = `${hours}h ${minutes}m`;

    const records = result.map((item) => {
      const hoursFloat = item.workingHours || 0;

      const hours = Math.floor(hoursFloat);
      const minutes = Math.floor((hoursFloat - hours) * 60);

      return {
        _id: item._id,
        employeeId: item.employeeId,
        checkIn: item.checkIn,
        checkOut: item.checkOut,
        status: item.status,
        date: item.date,

        workingTime: `${hours}h ${minutes}m`,

        workingHours: parseFloat(hoursFloat.toFixed(2)),
      };
    });

    return res.status(200).json({
      success: true,
      data: {
        month,
        totalHours: totalTime,
        absentDays,
        lateDays,
        records,
      },
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// get Attendance/monthlyReport/:month "for Hr and admin"
const getMonthlyAttendanceReport = async (req, res) => {
  try {
    const month = Number(req.params.month);

    const result = await attendanceModel.aggregate([
      {
        $match: {
          $expr: {
            $eq: [{ $month: "$date" }, month],
          },
        },
      },

      {
        $group: {
          _id: "$employeeId",

          totalHours: {
            $sum: "$workingHours",
          },

          presentDays: {
            $sum: {
              $cond: [{ $eq: ["$status", "present"] }, 1, 0],
            },
          },

          lateDays: {
            $sum: {
              $cond: [{ $eq: ["$status", "late"] }, 1, 0],
            },
          },

          absentDays: {
            $sum: {
              $cond: [{ $eq: ["$status", "absent"] }, 1, 0],
            },
          },
        },
      },

      {
        $lookup: {
          from: "users",
          localField: "_id",
          foreignField: "_id",
          as: "employee",
        },
      },

      {
        $unwind: "$employee",
      },
    ]);

    if (!result.length) {
      return res.status(404).json({
        success: false,
        message: "No attendance records found",
      });
    }

    const formatted = result.map((item) => {
      const hours = Math.floor(item.totalHours);
      const minutes = Math.round((item.totalHours - hours) * 60);

      const totalWorkingTime = `${hours}h ${minutes}m`;

      return {
        employee: {
          _id: item.employee._id,
          name: item.employee.name,
          email: item.employee.email,
        },

        totalWorkingTime,
        presentDays: item.presentDays,
        lateDays: item.lateDays,
        absentDays: item.absentDays,
      };
    });

    return res.status(200).json({
      success: true,
      message: "Monthly employees report",
      data: formatted,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// CheckIn
const checkIn = async (req, res) => {
  try {
    const employee = await employeeModel.findOne({
      userId: req.user.userId,
    });

    if (!employee) {
      return res.status(404).json({
        success: false,
        message: "Employee not found",
      });
    }

    const employeeId = employee._id;

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

    const openAttendance = await attendanceModel.findOne({
      employeeId,
      checkOut: null,
    });

    if (openAttendance) {
      const endOfWork = new Date(openAttendance.checkIn);
      endOfWork.setHours(17, 0, 0, 0);

      openAttendance.checkOut = endOfWork;
      openAttendance.workingHours = 8;
      openAttendance.status = "forgot_checkout";

      await openAttendance.save();
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

    await result.populate({
      path: "employeeId",
      populate: {
        path: "userId",
        select: "name email",
      },
    });

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
    const employee = await employeeModel.findOne({
      userId: req.user.userId,
    });

    if (!employee) {
      return res.status(404).json({
        success: false,
        message: "Employee not found",
      });
    }

    const employeeId = employee._id;

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
        message: "You are not checked in for today",
      });
    }

    const checkOutTime = new Date();

    const diff = checkOutTime - attendance.checkIn;

    const hours = Math.floor(diff / (1000 * 60 * 60));
    const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));

    const workingTime = `${hours}h ${minutes}m`;

    attendance.checkOut = checkOutTime;
    attendance.workingHours = diff / (1000 * 60 * 60);

    const result = await attendance.save();

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

// get my attendance/today
const getMyTodayAttendance = async (req, res) => {
  try {
    const employee = await employeeModel.findOne({
      userId: req.user.userId,
    });

    if (!employee) {
      return res.status(404).json({
        success: false,
        message: "Employee not found",
      });
    }

    const employeeId = employee._id;

    const startOfDay = new Date();
    startOfDay.setHours(0, 0, 0, 0);

    const endOfDay = new Date();
    endOfDay.setHours(23, 59, 59, 999);

    const attendance = await attendanceModel
      .findOne({
        employeeId,
        date: {
          $gte: startOfDay,
          $lte: endOfDay,
        },
      })
      .populate({
        path: "employeeId",
        populate: {
          path: "userId",
          select: "name email",
        },
      });

    return res.status(200).json({
      success: true,
      data: attendance || null,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

module.exports = {
  getTodayAttendance,
  getAttendance,
  getEmployeeAttendance,
  getMyTodayAttendance,
  getMonthlyAttendance,
  getMonthlyAttendanceReport,
  checkIn,
  checkout,
};
