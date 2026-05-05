const express = require("express");
const leaveRequestRouter = express.Router();

const {
  getLeaveRequests,
  getLeaveRequestByEmployee,
  getEmployeeLeaveRequests,
  getLeaveRequestsTypes,
  createLeaveRequest,
  updateLeaveRequestsStatus,
  cancelLeaveRequest,
} = require("../controllers/leaveRequestController");

const authorize = require("../middleware/Authorization");
const auth = require("../middleware/Authentication");

// get leaveRequests
leaveRequestRouter.get("/", auth, authorize(["hr", "admin"]), getLeaveRequests);

// get leaveRequest/employee/:id
leaveRequestRouter.get(
  "/employee/:id",
  auth,
  authorize(["hr", "admin"]),
  getLeaveRequestByEmployee,
);

// get leaveRequests/my
leaveRequestRouter.get("/my", auth, getEmployeeLeaveRequests);

// get leaveRequests/getLeaveRequestsTypes
leaveRequestRouter.get(
  "/LeaveRequestsTypes",
  auth,
  authorize(["hr", "admin"]),
  getLeaveRequestsTypes,
);

// create leaveRequest
leaveRequestRouter.post("/", auth, createLeaveRequest);

// update leaveRequests/:id/status
leaveRequestRouter.put(
  "/:id/status",
  auth,
  authorize(["hr", "admin"]),
  updateLeaveRequestsStatus,
);

// cancel leaveRequest/:id
leaveRequestRouter.delete("/:id", auth, cancelLeaveRequest);

module.exports = leaveRequestRouter;
