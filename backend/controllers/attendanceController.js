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
        createdAt: {
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
      })
      .sort({ createdAt: -1 });

    const formatted = data.map((item) => {
      let workingTime = "Still working";

      if (item.checkIn && item.checkOut) {
        const diff = item.checkOut - item.checkIn;

        const hours = Math.floor(diff / (1000 * 60 * 60));
        const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));

        workingTime = `${hours}h ${minutes}m`;
      }

      return {
        userId: item.employeeId?.userId,
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
      .populate({
        path: "employeeId",
        populate: {
          path: "userId",
          select: "name email",
        },
      })
      .sort({ createdAt: -1 });

    const formatted = data.map((item) => {
      let workingTime = "Still working";

      if (item.checkIn && item.checkOut) {
        const diff = new Date(item.checkOut) - new Date(item.checkIn);

        const hours = Math.floor(diff / (1000 * 60 * 60));
        const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));

        workingTime = `${hours}h ${minutes}m`;
      }

      return {
        employeeId: item.employeeId,
        date: item.date,
        checkIn: item.checkIn,
        checkOut: item.checkOut || null,
        workingTime,
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
    const month = Number(req.params.month);

    const employee = await employeeModel.findOne({
      userId: req.user.userId,
    });

    if (!employee) {
      return res.status(404).json({
        success: false,
        message: "Employee not found",
      });
    }

    const result = await attendanceModel.find({
      employeeId: employee._id,
      $expr: {
        $eq: [{ $month: "$date" }, month],
      },
    });

    let totalMinutes = 0;
    let absentDays = 0;
    let lateDays = 0;

    result.forEach((item) => {
      totalMinutes += (item.workingHours || 0) * 60;

      if (item.status === "absent") absentDays++;
      if (item.status === "late") lateDays++;
    });

    const hours = Math.floor(totalMinutes / 60);
    const minutes = Math.floor(totalMinutes % 60);

    const totalHours = totalMinutes / 60;

    const totalTime = `${hours}h ${minutes}m`;

    const records = result.map((item) => {
      const h = Math.floor(item.workingHours || 0);
      const m = Math.round(((item.workingHours || 0) - h) * 60);

      return {
        _id: item._id,
        checkIn: item.checkIn,
        checkOut: item.checkOut,
        status: item.status,
        date: item.date,
        workingTime: `${h}h ${m}m`,
      };
    });

    return res.status(200).json({
      success: true,
      data: {
        month,
        totalHours,
        totalTime,
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

    const start = new Date(new Date().getFullYear(), month - 1, 1);
    const end = new Date(new Date().getFullYear(), month, 0, 23, 59, 59, 999);

    const result = await attendanceModel.aggregate([
      {
        $match: {
          date: { $gte: start, $lte: end },
        },
      },

      {
        $group: {
          _id: "$employeeId",

          totalHours: { $sum: "$workingHours" },

          presentDays: {
            $sum: { $cond: [{ $eq: ["$status", "present"] }, 1, 0] },
          },

          lateDays: {
            $sum: { $cond: [{ $eq: ["$status", "late"] }, 1, 0] },
          },

          absentDays: {
            $sum: { $cond: [{ $eq: ["$status", "absent"] }, 1, 0] },
          },
        },
      },

      {
        $lookup: {
          from: "employees",
          localField: "_id",
          foreignField: "_id",
          as: "employee",
        },
      },

      { $unwind: "$employee" },

      {
        $lookup: {
          from: "users",
          localField: "employee.userId",
          foreignField: "_id",
          as: "user",
        },
      },

      { $unwind: "$user" },

      {
        $project: {
          _id: 1,
          totalHours: 1,

          presentDays: 1,
          lateDays: 1,
          absentDays: 1,

          employee: {
            _id: "$employee._id",
            jobTitle: "$employee.jobTitle",
          },

          user: {
            _id: "$user._id",
            name: "$user.name",
            email: "$user.email",
          },
        },
      },
    ]);

    return res.status(200).json({
      success: true,
      data: result,
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

    const startOfDay = new Date();
    startOfDay.setHours(0, 0, 0, 0);

    const endOfDay = new Date();
    endOfDay.setHours(23, 59, 59, 999);

    const attendance = await attendanceModel
      .findOne({
        employeeId: employee._id,
        date: { $gte: startOfDay, $lte: endOfDay },
      })
      .populate({
        path: "employeeId",
        populate: {
          path: "userId",
          select: "name email",
        },
      });

    if (!attendance) {
      return res.status(200).json({
        success: true,
        data: null,
      });
    }

    let workingTime = "Still working";

    if (attendance?.checkIn) {
      const start = new Date(attendance.checkIn);
      const end = attendance.checkOut
        ? new Date(attendance.checkOut)
        : new Date();

      const diff = end - start;

      const totalMinutes = Math.floor(diff / (1000 * 60));
      const hours = Math.floor(totalMinutes / 60);
      const minutes = totalMinutes % 60;

      workingTime = `${hours}h ${minutes}m`;
    }

    return res.status(200).json({
      success: true,
      data: {
        ...attendance.toObject(),
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
