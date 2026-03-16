import api from "./api";

export const mentorService = {
  async getFeed(filters = {}) {
    const res = await api.post("/mentors/discover", filters);
    return res.data;
  },

  async getMentor(mentorId) {
    const res = await api.get(`/mentors/${mentorId}`);
    return res.data;
  },

  async bookSession(data) {
    const res = await api.post("/mentors/sessions/book", data);
    return res.data;
  },

  async getMySessions() {
    const res = await api.get("/mentors/sessions/my");
    return res.data;
  },

  async completeSession(sessionId, data) {
    const res = await api.post(`/mentors/sessions/${sessionId}/complete`, data);
    return res.data;
  },
};

export default mentorService;