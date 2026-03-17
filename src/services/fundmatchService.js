import api from "./api";

export const fundmatchService = {
  async getMatches(filters = {}) {
    const res = await api.post("/fundmatch/match", filters);
    return res.data;
  },

  async getFunderDetail(funderId) {
    const res = await api.get(`/fundmatch/${funderId}`);
    return res.data;
  },

  async startApplication(data) {
    const res = await api.post("/fundmatch/apply", data);
    return res.data;
  },

  async getApplications() {
    const res = await api.get("/fundmatch/my/applications");
    return res.data;
  },
};

export default fundmatchService;