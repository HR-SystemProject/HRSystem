
import { API } from "./api";

// POST /users/signup
export const signup = (data) => API.post("/users/signup", data);

// POST /users/login
export const login = (data) => API.post("/users/login", data);

// POST /users/logout
export const logout = () => API.post("/users/logout");

// PUT /users/:id/profile
export const updateProfile = (id, data) =>
  API.put(`/users/${id}/profile`, data);

// POST /users/forget-password
export const forgetPassword = (data) =>
  API.post("/users/forget-password", data);

// POST /users/:id/change-password
export const changePassword = (id, data) =>
  API.post(`/users/${id}/change-password`, data);

// ADMIN

// GET /users
export const getUsers = () => API.get("/users");

// GET /users/:id
export const getUserById = (id) => API.get(`/users/${id}`);

// DELETE /users/:id
export const deleteUser = (id) => API.delete(`/users/${id}`);