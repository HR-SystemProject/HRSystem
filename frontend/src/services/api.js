// Axios setup
// Attaches token to requests

import axios from "axios";
import { getToken } from "../utils/auth";

export const API = axios.create({
  baseURL: "http://localhost:5000",
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
    console.log("❌ API ERROR:");
    console.log("URL:", err.config?.url);
    console.log("STATUS:", err.response?.status);
    console.log("DATA:", err.response?.data);
    return Promise.reject(err);
  }
);