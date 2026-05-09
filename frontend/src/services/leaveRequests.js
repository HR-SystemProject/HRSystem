import { API } from "./api";

// create leaveRequests
export const createLeaveRequests = (data) => API.post("/leaveRequests", data);

// get leaveRequests
export const getLeaveRequests = (page = 1, search = "") =>
  API.get(`/leaveRequests?page=${page}&limit=5&search=${search}`);

// get leaveRequests/my
export const getEmployeeLeaveRequests = () =>
  API.get("/leaveRequests/my");

//  get leaveRequests/getLeaveRequestsTypes
export const getLeaveRequestsTypes = () =>
  API.get("/leaveRequests/LeaveRequestsTypes");

// put leaveRequests/:id/status
export const updateLeaveRequestsStatus = (id, status) =>
  API.put(`/leaveRequests/${id}/status`, { status });

 // update leaveRequests/:id
export const updateMyLeaveRequest = (id, data) =>
  API.put(`/leaveRequests/${id}`, data);

// delete leaveRequests/:id
export const cancelLeaveRequest = (id) =>
  API.delete(`/leaveRequests/${id}`);


