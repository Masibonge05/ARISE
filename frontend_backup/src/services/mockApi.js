// src/services/mockApi.js
export async function getCurrentUser() {
  return {
    id: 1,
    name: "Sphiwe Demo",
    ecs_score: 50,
    persona: "Sphiwe",
  };
}

export async function getJobs() {
  return [
    { id: 1, title: "Demo Job 1", match: 87 },
    { id: 2, title: "Demo Job 2", match: 92 },
  ];
}

// Add other mock API functions as needed