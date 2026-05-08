const mongoose = require("mongoose");
const leaveRequestModel = require("../models/leaveRequestSchema");
const leaveRequestSchema = require("../models/leaveRequestSchema");

// get leaveRequests/
const getLeaveRequests = async (req, res) => {
  try {
    const userRole = req.user.role;

    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 5;
    const search = req.query.search || "";
    const skip = (page - 1) * limit;

    if (userRole !== "admin" && userRole !== "hr") {
      return res.status(403).json({
        success: false,
        message: "Forbidden",
      });
    }

    let leaveRequests = await leaveRequestModel
      .find({})
      .populate("employeeId", "name email")
      .populate("approvedBy", "name email");

    if (search) {
      leaveRequests = leaveRequests.filter((req) =>
        req.employeeId?.name?.toLowerCase().includes(search.toLowerCase()),
      );
    }

    const total = leaveRequests.length;

    const paginated = leaveRequests.slice(skip, skip + limit);

    res.status(200).json({
      success: true,
      message: "Leave requests fetched successfully",
      data: paginated,
      total,
      page,
      totalPages: Math.ceil(total / limit),
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// get leaveRequest/employee/:id
const getLeaveRequestByEmployee = async (req, res) => {
  try {
    const employeeId = req.params.id;

    const leaveRequests = await leaveRequestModel
      .find({
        employeeId,
      })
      .populate("employeeId", "name email")
      .populate("approvedBy", "name email");

    if (!leaveRequests || leaveRequests.length === 0) {
      return res.status(404).json({
        success: false,
        message: "No leave requests found for this employee",
      });
    }

    res.status(200).json({
      success: true,
      message: "Leave requests fetched successfully",
      data: leaveRequests,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// get leaveRequest/my
const getEmployeeLeaveRequests = async (req, res) => {
  try {
    const employeeId = req.user.userId;

    const leaveRequests = await leaveRequestModel
      .find({
        employeeId,
      })
      .populate("employeeId", "name email")
      .populate("approvedBy", "name email");

    res.status(200).json({
      success: true,
      message: "Leave requests fetched successfully",
      data: leaveRequests,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// get leaveRequest/LeaveRequestsTypes
const getLeaveRequestsTypes = (req, res) => {
  res.json({
    data: ["vacation", "sick", "emergency"],
  });
};

// create leaveRequest
const createLeaveRequest = async (req, res) => {
  try {
    const { leaveType, startDate, endDate, reason } = req.body;
    const employeeId = req.user.userId;

    if (!leaveType || !startDate || !endDate) {
      return res.status(400).json({
        success: false,
        message: "Missing data",
      });
    }

    if (new Date(startDate) > new Date(endDate)) {
      return res.status(400).json({
        success: false,
        message: "startDate cannot be after endDate",
      });
    }

    const leaveRequest = new leaveRequestModel({
      employeeId,
      leaveType,
      startDate,
      endDate,
      reason,
    });

    const existingLeave = await leaveRequestModel.findOne({
      employeeId,
      $or: [
        {
          startDate: { $lte: endDate },
          endDate: { $gte: startDate },
        },
      ],
    });

    if (existingLeave) {
      return res.status(400).json({
        success: false,
        message: "You already have a leave request in this period",
      });
    }

    await leaveRequest.save();

    await leaveRequest.populate("employeeId", "name email");

    res.status(201).json({
      success: true,
      message: "Leave request created successfully",
      data: leaveRequest,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// update leaveRequests/:id/status
const updateLeaveRequestsStatus = async (req, res) => {
  try {
    const { status } = req.body;
    const managerId = req.user.userId;
    const leaveRequestId = req.params.id;

    const leaveRequest = await leaveRequestModel.findById(leaveRequestId);

    if (!leaveRequest) {
      return res.status(404).json({
        success: false,
        message: "Leave request not found",
      });
    }

    if (leaveRequest.status !== "pending") {
      return res.status(400).json({
        success: false,
        message: "Request already processed",
      });
    }

    if (!["approved", "rejected"].includes(status)) {
      return res.status(400).json({
        success: false,
        message: "Invalid status",
      });
    }

    leaveRequest.status = status;
    leaveRequest.approvedBy = managerId;

    const result = await leaveRequest.save();

    await result.populate("employeeId", "name email");
    await result.populate("approvedBy", "name email");

    res.status(200).json({
      success: true,
      message: `Leave request ${status} successfully`,
      data: result,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// update leaveRequests/:id
const updatedMyLeaveRequest = async (req, res) => {
  try {
    const id = req.params.id;

    const leaveRequest = await leaveRequestModel.findById(id);

    if (!leaveRequest) {
      return res.status(404).json({
        success: false,
        message: "Leave request not found",
      });
    }

    if (leaveRequest.employeeId.toString() !== req.user.userId) {
      return res.status(403).json({
        success: false,
        message: "Forbidden",
      });
    }

    if (leaveRequest.status !== "pending") {
      return res.status(400).json({
        success: false,
        message: "Only pending requests can be updated",
      });
    }

    const { leaveType, startDate, endDate, reason } = req.body;

    if (startDate && endDate) {
      if (new Date(startDate) > new Date(endDate)) {
        return res.status(400).json({
          success: false,
          message: "Start date cannot be after end date",
        });
      }
    }

    const updated = await leaveRequestModel
      .findByIdAndUpdate(
        id,
        {
          leaveType,
          startDate,
          endDate,
          reason,
        },
        { new: true },
      )
      .populate("employeeId", "name email");

    res.status(200).json({
      success: true,
      message: "Leave request updated successfully",
      data: updated,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// Cancel leaveRequest/:id
const cancelLeaveRequest = async (req, res) => {
  try {
    const Id = req.params.id;
    const leaveRequest = await leaveRequestModel.findById(Id);

    if (!leaveRequest) {
      return res.status(404).json({
        success: false,
        message: "Leave request not found",
      });
    }

    if (leaveRequest.employeeId.toString() !== req.user.userId) {
      return res.status(403).json({
        success: false,
        message: "Forbidden",
      });
    }

    if (leaveRequest.status !== "pending") {
      return res.status(400).json({
        success: false,
        message: "Only pending requests can be cancelled",
      });
    }

    const result = await leaveRequestModel.findByIdAndDelete(Id);

    res.status(200).json({
      success: true,
      message: "Leave request cancelled successfully",
      data: leaveRequest,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

module.exports = {
  getLeaveRequests,
  getLeaveRequestByEmployee,
  getEmployeeLeaveRequests,
  getLeaveRequestsTypes,
  createLeaveRequest,
  updateLeaveRequestsStatus,
  updatedMyLeaveRequest,
  cancelLeaveRequest,
};
