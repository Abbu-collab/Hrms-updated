import axios from "axios";
import { API_BASE } from "./apiConfig.js";

const API_URL = `${API_BASE}/leave-balance`;

// JWT Authorization Header
const getAuthHeader = () => {
  const token = localStorage.getItem("token");

  return {
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
    },
  };
};

// Get logged-in employee's leave balance
export const getMyLeaveBalance = async () => {
  const response = await axios.get(
    `${API_URL}/me`,
    getAuthHeader()
  );
  return response.data;
};

// Get specific employee's leave balance (Admin/HR)
export const getEmployeeLeaveBalance = async (employeeId) => {
  const response = await axios.get(
    `${API_URL}/${employeeId}`,
    getAuthHeader()
  );
  return response.data;
};
