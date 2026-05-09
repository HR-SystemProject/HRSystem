import axios from "axios";
import { getToken } from "../utils/auth";

export const API = axios.create({
  baseURL: "http://localhost:5000",
});

API.interceptors.request.use((config) => {
  const token =  getToken();
  console.log("TOKEN FROM GETTOKEN:", getToken());

  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }

  return config;
});

API.interceptors.response.use(
  (res) => res,
  (err) => {
    return Promise.reject(err);
  }
);