import axios from "axios";

const API = "http://localhost:5000";

const getToken = () => localStorage.getItem("token");

export const createEmployee = async (data) => {
  const res = await axios.post(`${API}/employees`, data, {
    headers: { Authorization: `Bearer ${getToken()}` },
  });
  return res.data;
};

export const updateEmployee = async (id, data) => {
  const res = await axios.put(`${API}/employees/${id}`, data, {
    headers: { Authorization: `Bearer ${getToken()}` },
  });
  return res.data;
};

export const getAllEmployees = async () => {
  const res = await axios.get(`${API}/employees`, {
    headers: { Authorization: `Bearer ${getToken()}` },
  });
  return res.data;
};

export const getEmployeeById = async (id) => {
  const res = await axios.get(`${API}/employees/${id}`, {
    headers: { Authorization: `Bearer ${getToken()}` },
  });
  return res.data;
};

export const deleteEmployee = async (id) => {
  const res = await axios.delete(`${API}/employees/${id}`, {
    headers: { Authorization: `Bearer ${getToken()}` },
  });
  return res.data;
};