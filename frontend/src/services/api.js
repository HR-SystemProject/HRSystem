import axios from "axios";
import { getToken } from "../utils/auth";

export const API = axios.create({
  baseURL: "https://hrsystem-2-7b82.onrender.com"
});

API.interceptors.request.use((config) => {
  const token =  getToken();

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