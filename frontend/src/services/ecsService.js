import api from "./api";

export const ecsService = {
  async getScore() {
    const res = await api.get("/ecs/score");
    return res.data;
  },

  async getHistory() {
    const res = await api.get("/ecs/history");
    return res.data;
  },

  async getBreakdown() {
    const res = await api.get("/ecs/breakdown");
    return res.data;
  },

  async getLenders() {
    const res = await api.get("/ecs/lenders");
    return res.data;
  },

  async recordEvent(eventType, metadata = {}) {
    const res = await api.post("/ecs/event", { event_type: eventType, metadata });
    return res.data;
  },
};

export default ecsService;