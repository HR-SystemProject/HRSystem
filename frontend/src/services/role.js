import { API } from "./api";

// GET /roles
export const getRoles = () => API.get("/roles");

// GET /roles/:id
export const getRoleById = (id) => API.get(`/roles/${id}`);

// POST /roles
export const createRole = (data) => API.post("/roles", data);

// PUT /roles/:id
export const updateRole = (id, data) => API.put(`/roles/${id}`, data);

// DELETE /roles/:id
export const deleteRole = (id) => API.delete(`/roles/${id}`);
