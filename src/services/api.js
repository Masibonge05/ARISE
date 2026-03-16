// src/api.js
// Quick mock API for frontend-only deployment

// Mock user data
const mockUser = {
  id: 1,
  name: "Sphiwe Demo",
  ecs_score: 50,
  persona: "Sphiwe",
};

// Mock job feed
const mockJobs = [
  { id: 1, title: "Demo Job 1", match: 87 },
  { id: 2, title: "Demo Job 2", match: 92 },
];

// Simulate network delay
const delay = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

const api = {
  get: async (url) => {
    await delay(200); // simulate network
    if (url.endsWith("/users/me")) return { data: mockUser };
    if (url.endsWith("/jobs")) return { data: mockJobs };
    return { data: {} };
  },
  post: async (url, payload) => {
    await delay(200);
    console.log("POST to", url, payload);
    return { data: { success: true } };
  },
  put: async (url, payload) => {
    await delay(200);
    console.log("PUT to", url, payload);
    return { data: { success: true } };
  },
  delete: async (url) => {
    await delay(200);
    console.log("DELETE to", url);
    return { data: { success: true } };
  },
};

// Optional: mock upload functions
export const uploadBase64 = async (endpoint, file, documentType) => {
  await delay(200);
  console.log("Mock uploadBase64", endpoint, documentType);
  return { data: { url: "https://via.placeholder.com/150" } };
};

export const uploadFile = async (endpoint, file, extraFields = {}) => {
  await delay(200);
  console.log("Mock uploadFile", endpoint, extraFields);
  return { data: { url: "https://via.placeholder.com/150" } };
};

export default api;