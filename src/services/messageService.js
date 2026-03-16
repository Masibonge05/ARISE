import api from "./api";

export const messageService = {
  async getThreads() {
    const res = await api.get("/messages/");
    return res.data;
  },

  async getThread(threadId) {
    const res = await api.get(`/messages/${threadId}`);
    return res.data;
  },

  async sendMessage(threadId, text, recipientId) {
    const res = await api.post("/messages/", {
      thread_id: threadId, text, recipient_id: recipientId,
    });
    return res.data;
  },

  async markRead(threadId) {
    const res = await api.patch(`/messages/${threadId}/read`);
    return res.data;
  },

  async getUnreadCount() {
    const res = await api.get("/messages/unread/count");
    return res.data;
  },
};

export default messageService;