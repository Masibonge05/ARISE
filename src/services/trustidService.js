import api from "./api";

export const trustidService = {
  async getStatus() {
    const res = await api.get("/trustid/status");
    return res.data;
  },

  async scanIDDocument(fileBase64, documentType = "id") {
    const res = await api.post("/trustid/scan-document", {
      file_base64: fileBase64,
      document_type: documentType,
    });
    return res.data;
  },

  async verifyReference(token) {
    const res = await api.post("/trustid/verify-reference", { token });
    return res.data;
  },

  async assessSkill(skillName, answers) {
    const res = await api.post("/trustid/assess-skill", {
      skill_name: skillName,
      answers,
    });
    return res.data;
  },

  async getBadges() {
    const res = await api.get("/trustid/badges");
    return res.data;
  },
};

export default trustidService;