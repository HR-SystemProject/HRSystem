const mongoose = require("mongoose");
const leaveRequestModel = require("../models/leaveRequestSchema");

// get leaveRequests/
const getLeaveRequests = async (req, res) => {
  try {
    const userRole = req.user.role;

    if (userRole !== "admin" && userRole !== "hr") {
      return res.status(403).json({
        success: false,
        message: "Forbidden",
      });
    }

    const leaveRequests = await leaveRequestModel.find({});

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

// get leaveRequest/employee/:id
const getLeaveRequestByEmployee = async (req, res) => {
  try {
    const employeeId = req.params.id;

    const leaveRequests = await leaveRequestModel.find({
      employeeId,
    });

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

    const leaveRequests = await leaveRequestModel.find({
      employeeId,
    });

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

// create leaveRequest
const createLeaveRequest = async (req, res) => {
  try {
    const { leaveType, startDate, endDate, reason } = req.body;
    const employeeId = req.user.userId;
    console.log(employeeId);

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

    await leaveRequest.save();

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
  createLeaveRequest,
  updateLeaveRequestsStatus,
  cancelLeaveRequest,
};
