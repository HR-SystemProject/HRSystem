import { API } from "./api";

/* AUTH */

// SIGNUP
export const signup = (data) => {
  return API.post("/users/signup", data);
};

/* USERS CRUD */

// GET ALL USERS
export const getUsers = () => {
  return API.get("/users");
};

// GET USER BY ID
export const getUserById = (id) => {
  return API.get(`/users/${id}`);
};

// DELETE USER
export const deleteUser = (id) => {
  return API.delete(`/users/${id}`);
};

/* PASSWORD */


// CHANGE PASSWORD
export const changePassword = (data) => {
  console.log("SENDING FROM FRONT:", data);

  return API.post("/users/changePassword", JSON.stringify(data), {
    headers: {
      "Content-Type": "application/json",
    },
  });
};


/* PROFILE */

// UPDATE PROFILE
export const updateProfile = (id, data) => {
  return API.put(`/users/${id}/profile`, data);
};

// UPDATE USER (status / role / etc)
export const updateUser = (id, data) => {
  return API.put(`/users/${id}`, data);
};

// update user Role
export const updateUserRole = (id, data) => {
  return API.put(`/users/role/${id}`, data);
};
