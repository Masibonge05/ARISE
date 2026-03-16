import api from "./api";

export const launchpadService = {
  async getStatus() {
    const res = await api.get("/launchpad/status");
    return res.data;
  },

  async submitStep(stepNumber, data) {
    const res = await api.post(`/launchpad/step/${stepNumber}`, data);
    return res.data;
  },

  async uploadCIPC(fileBase64) {
    const res = await api.post("/launchpad/cipc-upload", { file_base64: fileBase64 });
    return res.data;
  },

  async complete() {
    const res = await api.post("/launchpad/complete");
    return res.data;
  },
};

export default launchpadService;