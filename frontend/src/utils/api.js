// src/utils/api.js
import axios from "axios";
import { auth } from "../config/firebase"; // make sure this is correct

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL,
  withCredentials: true,
  headers: {
    "Content-Type": "application/json",
  },
});

// Interceptor to inject latest token every time
api.interceptors.request.use(async (config) => {
  const user = auth.currentUser;
  if (user) {
    const token = await user.getIdToken(true); // 🔁 force refresh
    config.headers.Authorization = `Bearer ${token}`;
  } else {
    const userId = localStorage.getItem("userId");
    if (userId) {
      config.headers["x-user-id"] = userId;
    }
  }
  return config;
});

export default api;
