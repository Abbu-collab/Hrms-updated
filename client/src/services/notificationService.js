import axios from "axios";
import { API_BASE } from "./apiConfig.js";

const API = `${API_BASE}/notifications`;

const getAuthConfig = () => ({
  headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
});

export const getNotifications = async () => {
  const res = await axios.get(API, getAuthConfig());
  return res.data;
};

export const markNotificationRead = async (id) => {
  const res = await axios.put(`${API}/${id}/read`, {}, getAuthConfig());
  return res.data;
};

export const markAllNotificationsRead = async () => {
  const res = await axios.put(`${API}/read-all`, {}, getAuthConfig());
  return res.data;
};
