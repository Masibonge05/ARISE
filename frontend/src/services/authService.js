import api from "./api";
import { STORAGE_KEYS } from "../utils/constants";

export const authService = {
  async login(email, password) {
    const res = await api.post("/auth/login", { email, password });
    if (res.data.access_token) {
      localStorage.setItem(STORAGE_KEYS.TOKEN, res.data.access_token);
    }
    return res.data;
  },

  async register(data) {
    const res = await api.post("/auth/register", data);
    return res.data;
  },

  async getMe() {
    const res = await api.get("/auth/me");
    return res.data;
  },

  async verifyEmail(token) {
    const res = await api.post("/auth/verify-email", { token });
    return res.data;
  },

  async forgotPassword(email) {
    const res = await api.post("/auth/forgot-password", { email });
    return res.data;
  },

  async resetPassword(token, new_password) {
    const res = await api.post("/auth/reset-password", { token, new_password });
    return res.data;
  },

  async changePassword(current_password, new_password) {
    const res = await api.post("/auth/change-password", { current_password, new_password });
    return res.data;
  },

  logout() {
    localStorage.removeItem(STORAGE_KEYS.TOKEN);
    localStorage.removeItem(STORAGE_KEYS.USER);
  },

  getToken() {
    return localStorage.getItem(STORAGE_KEYS.TOKEN);
  },

  isAuthenticated() {
    return !!localStorage.getItem(STORAGE_KEYS.TOKEN);
  },
};

export default authService;