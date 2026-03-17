// ECS score calculation utilities (client-side mirror of backend logic)

export const ECS_MAX = 850;

export const FACTOR_WEIGHTS = {
  identity_verification: { max: 200, label: "Identity & Trust",   icon: "🪪" },
  employment_history:    { max: 200, label: "Employment History",  icon: "💼" },
  financial_behaviour:   { max: 150, label: "Financial Behaviour", icon: "💳" },
  skill_validation:      { max: 150, label: "Skills Validated",    icon: "⚡" },
  community_trust:       { max: 150, label: "Community Trust",     icon: "🤝" },
};

export const ECS_EVENTS = {
  // Identity
  email_verified:         { points: 25,  factor: "identity_verification", label: "Email verified" },
  id_document_verified:   { points: 50,  factor: "identity_verification", label: "ID verified" },
  profile_photo_added:    { points: 10,  factor: "identity_verification", label: "Photo added" },
  profile_bio_completed:  { points: 10,  factor: "identity_verification", label: "Bio written" },
  // Skills
  skill_assessed:         { points: 15,  factor: "skill_validation",      label: "Skill assessed" },
  course_completed:       { points: 20,  factor: "skill_validation",      label: "Course completed" },
  qualification_verified: { points: 25,  factor: "skill_validation",      label: "Qualification verified" },
  // Employment
  work_experience_added:  { points: 20,  factor: "employment_history",    label: "Work experience" },
  job_completed:          { points: 35,  factor: "employment_history",    label: "Job completed" },
  reference_verified:     { points: 40,  factor: "employment_history",    label: "Reference verified" },
  // Community
  mentor_session:         { points: 25,  factor: "community_trust",       label: "Mentor session" },
  review_received_5star:  { points: 20,  factor: "community_trust",       label: "5-star review" },
  safety_report_valid:    { points: 15,  factor: "community_trust",       label: "Safety report" },
  // Financial
  payment_received:       { points: 30,  factor: "financial_behaviour",   label: "Payment received" },
  business_registered:    { points: 100, factor: "financial_behaviour",   label: "Business registered" },
};

/**
 * Get ECS band from score
 */
export function getECSBand(score) {
  const bands = [
    { min: 750, label: "Elite",       color: "#A8E6CF", description: "Top tier — eligible for premium opportunities" },
    { min: 650, label: "Thriving",    color: "#4ECDC4", description: "Strong profile — most doors open" },
    { min: 500, label: "Established", color: "#FFD93D", description: "Good standing — growing opportunities" },
    { min: 300, label: "Developing",  color: "#FF6B35", description: "Building trust — keep verifying" },
    { min: 0,   label: "Building",    color: "#888",    description: "Just starting — complete your TrustID" },
  ];
  return bands.find(b => score >= b.min) || bands[bands.length - 1];
}

/**
 * Calculate what events are still available (not yet earned)
 */
export function getAvailableEvents(earnedEvents = []) {
  return Object.entries(ECS_EVENTS)
    .filter(([key]) => !earnedEvents.includes(key))
    .map(([key, evt]) => ({ key, ...evt }));
}

/**
 * Calculate potential ECS from remaining events
 */
export function getPotentialECS(currentScore, earnedEvents = []) {
  const remaining = getAvailableEvents(earnedEvents);
  const potential = remaining.reduce((sum, e) => sum + e.points, 0);
  return Math.min(ECS_MAX, currentScore + potential);
}