import { API } from "./api";

export const login = (data) => {
  return API.post("users/login", data);
};

// export const register = (data) => {
//   return API.post("/users/signup", data);
// };