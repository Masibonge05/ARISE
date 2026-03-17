import api from "./api";

export const freelanceService = {
  async getFeed(filters = {}) {
    const params = new URLSearchParams(filters).toString();
    const res = await api.get(`/freelance/?${params}`);
    return res.data;
  },

  async getProject(projectId) {
    const res = await api.get(`/freelance/${projectId}`);
    return res.data;
  },

  async submitProposal(projectId, data) {
    const res = await api.post(`/freelance/${projectId}/propose`, data);
    return res.data;
  },

  async getActiveProjects() {
    const res = await api.get("/freelance/my/active");
    return res.data;
  },

  async getEarnings() {
    const res = await api.get("/freelance/my/earnings");
    return res.data;
  },

  async deliverProject(projectId, notes, url) {
    const res = await api.post(`/freelance/${projectId}/deliver`, {
      delivery_notes: notes, delivery_url: url,
    });
    return res.data;
  },

  async rateProject(projectId, rating, review) {
    const res = await api.post(`/freelance/${projectId}/rate`, { rating, review });
    return res.data;
  },

  async postProject(data) {
    const res = await api.post("/freelance/", data);
    return res.data;
  },
};

export default freelanceService;