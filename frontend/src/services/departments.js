import { API } from "./api";

// GET /departments
export const getDepartments = () => API.get("/departments");

// GET /departments/:id
export const getDepartmentById = (id) => API.get(`/departments/${id}`);

// POST /departments
export const createDepartment = (data) => API.post("/departments", data);

// PUT /departments/:id
export const updateDepartment = (id, data) => API.put(`/departments/${id}`, data);

// DELETE /departments/:id
export const deleteDepartment = (id) => API.delete(`/departments/${id}`);