import { API } from "./api";

// GET all employees
export const getEmployees = () => API.get("/employees");

// Get my employee
export const getMyEmployee = () => API.get("/employees/me");

// GET employee by id
export const getEmployeeById = (id) => API.get(`/employees/${id}`);

// CREATE employee (NO userId here)
export const createEmployee = (data) => API.post("/employees", data);

// UPDATE employee
export const updateEmployee = (id, data) =>
  API.put(`/employees/${id}`, data);

// DELETE employee
export const deleteEmployee = (id) => API.delete(`/employees/${id}`);