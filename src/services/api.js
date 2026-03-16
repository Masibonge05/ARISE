import axios from "axios";

const api = axios.create({
  baseURL: process.env.REACT_APP_API_URL || "http://localhost:8000/api/v1",
  timeout: 30000,
  headers: { "Content-Type": "application/json" },
});

// ── Request interceptor — attach token ────────────────────────────────────────
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("arise_token");
    if (token) config.headers.Authorization = `Bearer ${token}`;
    return config;
  },
  (error) => Promise.reject(error)
);

// ── Response interceptor — handle errors globally ─────────────────────────────
api.interceptors.response.use(
  (response) => response,
  (error) => {
    const status = error.response?.status;
    if (status === 401) {
      localStorage.removeItem("arise_token");
      if (window.location.pathname !== "/login") window.location.href = "/login";
    }
    if (status === 429) console.warn("ARISE: Rate limit — slow down");
    if (status >= 500) console.error("ARISE: Server error", status, error.config?.url);
    return Promise.reject(error);
  }
);

// ── Upload file as base64 (Huawei OCR) ────────────────────────────────────────
export const uploadBase64 = (endpoint, file, documentType) =>
  new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = async (e) => {
      try {
        const base64 = e.target.result.split(",")[1];
        resolve(await api.post(endpoint, { file_base64: base64, document_type: documentType }));
      } catch (err) { reject(err); }
    };
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });

// ── Upload multipart form ─────────────────────────────────────────────────────
export const uploadFile = (endpoint, file, extraFields = {}) => {
  const fd = new FormData();
  fd.append("file", file);
  Object.entries(extraFields).forEach(([k, v]) => fd.append(k, v));
  return api.post(endpoint, fd, { headers: { "Content-Type": "multipart/form-data" } });
};

export default api;