// src/services/axiosInstance.js
import axios from "axios";

// اینجا بیس یو آر ال رو ست می‌کنی
const api = axios.create({
  baseURL: "http://192.168.1.3:8000/api/",
  headers: {
    "Content-Type": "application/json",
  },
});

// Attach token from localStorage if exists
const existingToken = localStorage.getItem("token");
if (existingToken) {
  api.defaults.headers.common["Authorization"] = `Bearer ${existingToken}`;
}

export default api;