import api from "./api";

export const userService = {
  async getProfile() {
    const res = await api.get("/users/me");
    return res.data;
  },

  async updateProfile(data) {
    const res = await api.patch("/users/me", data);
    return res.data;
  },

  async addSkill(skillData) {
    const res = await api.post("/users/me/skills", skillData);
    return res.data;
  },

  async removeSkill(skillId) {
    const res = await api.delete(`/users/me/skills/${skillId}`);
    return res.data;
  },

  async addQualification(data) {
    const res = await api.post("/users/me/qualifications", data);
    return res.data;
  },

  async addWorkExperience(data) {
    const res = await api.post("/users/me/work-experience", data);
    return res.data;
  },

  async getPublicProfile(userId) {
    const res = await api.get(`/users/${userId}/profile`);
    return res.data;
  },

  async uploadProfilePhoto(file) {
    const formData = new FormData();
    formData.append("file", file);
    const res = await api.post("/users/me/photo", formData, {
      headers: { "Content-Type": "multipart/form-data" },
    });
    return res.data;
  },

  async getNotifications() {
    const res = await api.get("/users/me/notifications");
    return res.data;
  },

  async markNotificationRead(notifId) {
    const res = await api.patch(`/users/me/notifications/${notifId}/read`);
    return res.data;
  },
};

export default userService;