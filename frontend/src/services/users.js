import axios from "axios";

const API = "http://localhost:5000";

const getToken = () => localStorage.getItem("token");

export const signup = async (data) => {
  const res = await axios.post(`${API}/auth/register`, data);
  return res.data;
};

export const login = async (data) => {
  const res = await axios.post(`${API}/auth/login`, data);
  return res.data;
};

export const logout = () => {
  localStorage.removeItem("token");
};

export const updateProfile = async (data) => {
  const res = await axios.put(`${API}/users/update-profile`, data, {
    headers: { Authorization: `Bearer ${getToken()}` },
  });
  return res.data;
};

export const forgetPassword = async (email) => {
  const res = await axios.post(`${API}/auth/forget-password`, { email });
  return res.data;
};

export const changePassword = async (data) => {
  const res = await axios.post(`${API}/auth/change-password`, data, {
    headers: { Authorization: `Bearer ${getToken()}` },
  });
  return res.data;
};

export const getAllUsers = async () => {
  const res = await axios.get(`${API}/users`, {
    headers: { Authorization: `Bearer ${getToken()}` },
  });
  return res.data;
};

export const getUserById = async (id) => {
  const res = await axios.get(`${API}/users/${id}`, {
    headers: { Authorization: `Bearer ${getToken()}` },
  });
  return res.data;
};

export const deleteUser = async (id) => {
  const res = await axios.delete(`${API}/users/${id}`, {
    headers: { Authorization: `Bearer ${getToken()}` },
  });
  return res.data;
};