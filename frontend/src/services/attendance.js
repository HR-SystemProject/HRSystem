import { API } from "./api";

// CheckIn

// Checkout

// get attendance/today
export const getTodayAttendance = () => API.get("/attendance/today");

// get Attendance/month/:month

// get Attendance/monthlyReport/:month
export const getMonthlyAttendanceReport = (month) =>
  API.get(`/attendance/monthlyReport/${month}`);

// get attendance/employee/:id
export const getEmployeeAttendance = (id) =>
  API.get(`/attendance/employee/${id}`);

// get Attendance
export const getAllAttendance = () => API.get("/attendance");
