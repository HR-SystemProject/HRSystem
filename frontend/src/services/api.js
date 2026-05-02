// Axios setup
// Attaches token to requests

import axios from "axios";
import { getToken } from "../utils/auth";

export const API = axios.create({
  baseURL: "http://localhost:5000",
});

API.interceptors.request.use((config) => {
  const token = localStorage.getItem("token");

  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }

  return config;
});
