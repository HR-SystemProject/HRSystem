import { API } from "./api";

export const login = (data) => {
  return API.post("users/login", data);
};
