// src/config/getAuthHeaders.js
import { auth } from "./firebase";

export const getAuthHeaders = async () => {
  const user = auth.currentUser;

  if (user) {
    const token = await user.getIdToken(); 
    return {
      Authorization: `Bearer ${token}`,
    };
  }

  const userId = localStorage.getItem("userId");
  if (userId) {
    return {
      "x-user-id": userId,
    };
  }

  return {};
};
