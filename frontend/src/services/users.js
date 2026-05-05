import axios from "axios";

const API = "http://localhost:5000/users";

/* AUTH */

// SIGNUP
export const signup = (data) => {
  return axios.post(`${API}/signup`, data);
};

// LOGIN
export const login = (data) => {
  return axios.post(`${API}/login`, data);
};

// LOGOUT
export const logout = () => {
  return axios.post(
    `${API}/logout`,
    {},
    {
      headers: {
        Authorization: `Bearer ${localStorage.getItem("token")}`,
      },
    },
  );
};

/* USERS CRUD (ADMIN)*/

// GET ALL USERS
export const getUsers = () => {
  return axios.get(`${API}`, {
    headers: {
      Authorization: `Bearer ${localStorage.getItem("token")}`,
    },
  });
};

// GET USER BY ID
export const getUserById = (id) => {
  return axios.get(`${API}/${id}`, {
    headers: {
      Authorization: `Bearer ${localStorage.getItem("token")}`,
    },
  });
};

// DELETE USER
export const deleteUser = (id) => {
  return axios.delete(`${API}/${id}`, {
    headers: {
      Authorization: `Bearer ${localStorage.getItem("token")}`,
    },
  });
};

/*PASSWORD*/

// FORGET PASSWORD
export const forgetPassword = (data) => {
  return axios.post(`${API}/forget-password`, data);
};

// CHANGE PASSWORD
export const changePassword = (data) => {
  return axios.post(`${API}/change-password`, data);
};

/* PROFILE*/

// UPDATE PROFILE
export const updateProfile = (id, data) => {
  return axios.put(`${API}/${id}/profile`, data, {
    headers: {
      Authorization: `Bearer ${localStorage.getItem("token")}`,
    },
  });
};

// put status
export const updateUser = (id, data) => {
  return axios.put(`${API}/${id}`, data, {
    headers: {
      Authorization: `Bearer ${localStorage.getItem("token")}`,
    },
  });
};
