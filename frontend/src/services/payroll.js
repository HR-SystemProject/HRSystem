import { API } from "./api";

// GET /payroll
export const getPayrolls = () => API.get("/payroll");

// GET /payroll/employee/:id
export const getPayrollByEmployee = (id) =>
  API.get(`/payroll/employee/${id}`);

// GET /payroll/my
export const getMyPayroll = () => API.get("/payroll/my");

// GET /payroll/month/:month
export const getPayrollByMonth = (month) =>
  API.get(`/payroll/month/${month}`);

// POST /payroll
export const createPayroll = (data) =>
  API.post("/payroll", data);

// PUT /payroll/:id
export const updatePayroll = (id, data) =>
  API.put(`/payroll/${id}`, data);

// PATCH /payroll/:id/status
export const updatePayrollStatus = (id, data) =>
  API.patch(`/payroll/${id}/status`, data);

// POST /payroll/calculate
export const calculatePayroll = (data) =>
  API.post("/payroll/calculate", data);