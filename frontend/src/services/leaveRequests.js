import { API } from "./api";

// create leaveRequests
export const createLeaveRequests = (data) => API.post("/leaveRequests", data);

// get leaveRequests/employee/:id
// export const getEmployeeLeaveRequests = (id) =>
//   API.post(`/leaveRequests/employee/${id}`);

// get leaveRequests
export const getLeaveRequests = (page = 1, search = "") =>
  API.get(`/leaveRequests?page=${page}&limit=5&search=${search}`);

// get leaveRequests/my

//  get leaveRequests/getLeaveRequestsTypes
export const getLeaveRequestsTypes = () =>
  API.get("/leaveRequests/LeaveRequestsTypes");

// patch leaveRequests/:id/status
export const updateLeaveRequestsStatus = (id, status) =>
  API.put(`/leaveRequests/${id}/status`, { status });

// delete leaveRequests/:id
