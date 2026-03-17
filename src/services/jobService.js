import api from "./api";

export const jobService = {
  async getFeed(filters = {}) {
    const params = new URLSearchParams(filters).toString();
    const res = await api.get(`/jobs/?${params}`);
    return res.data;
  },

  async getJob(jobId) {
    const res = await api.get(`/jobs/${jobId}`);
    return res.data;
  },

  async applyToJob(jobId, data) {
    const res = await api.post(`/jobs/${jobId}/apply`, data);
    return res.data;
  },

  async getApplications() {
    const res = await api.get("/jobs/my/applications");
    return res.data;
  },

  async flagJob(jobId, reason, description, isAnonymous = true) {
    const res = await api.post(`/jobs/${jobId}/flag`, {
      reason, description, is_anonymous: isAnonymous,
    });
    return res.data;
  },

  async getEmployerProfile(employerId) {
    const res = await api.get(`/jobs/employers/${employerId}`);
    return res.data;
  },

  // Employer endpoints
  async postJob(data) {
    const res = await api.post("/jobs/", data);
    return res.data;
  },

  async updateApplicationStatus(appId, status, extra = {}) {
    const res = await api.patch(`/jobs/applications/${appId}/status`, { status, ...extra });
    return res.data;
  },
};

export default jobService;