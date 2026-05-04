import { API } from "./api";

// POST /employees
export const createEmployee = (data) =>
  API.post("/employees", data);

// GET /employees
export const getEmployees = () =>
  API.get("/employees");

// GET /employees/:id
export const getEmployeeById = (id) =>
  API.get(`/employees/${id}`);

// PUT /employees/:id
export const updateEmployee = (id, data) =>
  API.put(`/employees/${id}`, data);

// DELETE /employees/:id
export const deleteEmployee = (id) =>
  API.delete(`/employees/${id}`);