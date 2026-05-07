import { API } from "./api";

// CheckIn
export const checkIn = () => API.post("/attendance/checkIn");

// Checkout
export const checkOut = () => API.post("/attendance/checkOut");

// get attendance/today
export const getTodayAttendance = () => API.get("/attendance/today");

// get attendance/myToday
export const getMyTodayAttendance = () => API.get("/attendance/meToday");

// get Attendance/month/:month

// get Attendance/monthlyReport/:month
export const getMonthlyAttendanceReport = (month) =>
  API.get(`/attendance/monthlyReport/${month}`);

// get attendance/employee/:id
export const getEmployeeAttendance = (id) =>
  API.get(`/attendance/employee/${id}`);

// get Attendance
export const getAttendance = () => API.get("/attendance");
