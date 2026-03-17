import api from "./api";

export const govlinkService = {
  async login(email, password) {
    const res = await api.post("/auth/login", { email, password, portal: "govlink" });
    return res.data;
  },

  async getDashboard() {
    const res = await api.get("/govlink/dashboard");
    return res.data;
  },

  async getMapData(metric = "registrations") {
    const res = await api.get(`/govlink/map?metric=${metric}`);
    return res.data;
  },

  async getUserAnalytics() {
    const res = await api.get("/govlink/users");
    return res.data;
  },

  async getFundingAnalytics() {
    const res = await api.get("/govlink/funds");
    return res.data;
  },

  async exportReport(type) {
    const res = await api.get(`/govlink/export/${type}`, { responseType: "blob" });
    return res.data;
  },
};

export default govlinkService;