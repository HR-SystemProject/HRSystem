// Axios setup
// Attaches token to requests


import axios from "axios";

export const API = axios.create({
  baseURL: "http://localhost:5000",
});