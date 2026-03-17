import api from "./api";

export const investorService = {
  async getFeed(filters = {}) {
    const res = await api.post("/investors/discover", filters);
    return res.data;
  },

  async getInterests() {
    const res = await api.get("/investors/my/interests");
    return res.data;
  },

  async respondToInterest(interestId, accept, message) {
    const res = await api.post(`/investors/interests/${interestId}/respond`, {
      accept, entrepreneur_response: message,
    });
    return res.data;
  },

  async toggleVisibility(visible) {
    const res = await api.patch("/investors/my/visibility", { is_visible_to_investors: visible });
    return res.data;
  },

  async getProfile(investorId) {
    const res = await api.get(`/investors/${investorId}/profile`);
    return res.data;
  },
};

export default investorService;