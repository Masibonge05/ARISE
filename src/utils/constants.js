// ARISE Platform Constants

export const APP_NAME = "ARISE";
export const APP_VERSION = "1.0.0";
export const API_BASE = process.env.REACT_APP_API_URL || "http://localhost:8000/api/v1";

// Persona types
export const PERSONAS = {
  JOB_SEEKER:   "job_seeker",
  FREELANCER:   "freelancer",
  ENTREPRENEUR: "entrepreneur",
  EMPLOYER:     "employer",
  INVESTOR:     "investor",
  MENTOR:       "mentor",
  GOVERNMENT:   "government",
};

// ECS score bands
export const ECS_BANDS = [
  { min: 750, max: 850, label: "Elite",       color: "#A8E6CF", icon: "🏆" },
  { min: 650, max: 749, label: "Thriving",    color: "#4ECDC4", icon: "🌟" },
  { min: 500, max: 649, label: "Established", color: "#FFD93D", icon: "⭐" },
  { min: 300, max: 499, label: "Developing",  color: "#FF6B35", icon: "🔥" },
  { min: 0,   max: 299, label: "Building",    color: "#888",    icon: "🌱" },
];

export const ECS_MAX = 850;

// SA Provinces
export const SA_PROVINCES = [
  "Gauteng","Western Cape","KwaZulu-Natal","Eastern Cape",
  "Limpopo","Mpumalanga","North West","Free State","Northern Cape",
];

// Job types
export const JOB_TYPES = [
  { value: "full_time",  label: "Full Time" },
  { value: "part_time",  label: "Part Time" },
  { value: "contract",   label: "Contract" },
  { value: "internship", label: "Internship" },
  { value: "once_off",   label: "Once-off" },
];

// Work styles
export const WORK_STYLES = [
  { value: "on_site", label: "On-site" },
  { value: "remote",  label: "Remote" },
  { value: "hybrid",  label: "Hybrid" },
];

// SA Languages
export const SA_LANGUAGES = [
  "English","isiZulu","Afrikaans","Sesotho","Xhosa",
  "Sepedi","Setswana","Tshivenda","Xitsonga","siSwati","isiNdebele",
];

// Business sectors
export const SECTORS = [
  "Technology","Fashion & Apparel","Food & Beverage","Agriculture",
  "Healthcare","Education","Finance","Retail","Manufacturing",
  "Construction","Creative Arts","Tourism","Transport","Other",
];

// Freelance categories
export const FREELANCE_CATEGORIES = [
  "design","development","writing","photography",
  "translation","marketing","video","crafts","tutoring","other",
];

// Verification types
export const VERIFICATION_TYPES = {
  EMAIL:    { label: "Email",           ecs: 25,  icon: "✉️" },
  IDENTITY: { label: "Identity (SA ID)", ecs: 50,  icon: "🪪" },
  PHOTO:    { label: "Profile Photo",   ecs: 10,  icon: "📸" },
  BIO:      { label: "Profile Bio",     ecs: 10,  icon: "✍️" },
  QUAL:     { label: "Qualification",   ecs: 25,  icon: "🎓" },
  SKILL:    { label: "Skill Assessment", ecs: 15,  icon: "⚡" },
  WORK:     { label: "Work Experience", ecs: 20,  icon: "💼" },
  BUSINESS: { label: "Business Reg",    ecs: 100, icon: "🚀" },
};

// Design tokens
export const COLORS = {
  bg:          "#0A0A0F",
  card:        "rgba(255,255,255,0.03)",
  border:      "rgba(255,255,255,0.07)",
  text:        "#E8E8F0",
  muted:       "#888",
  faint:       "#555",
  orange:      "#FF6B35",
  teal:        "#4ECDC4",
  yellow:      "#FFD93D",
  mint:        "#A8E6CF",
  red:         "#FF4444",
};

// Local storage keys
export const STORAGE_KEYS = {
  TOKEN:      "arise_token",
  USER:       "arise_user",
  PERSONA:    "arise_persona",
  THEME:      "arise_theme",
  ONBOARDING: "arise_onboarding_step",
};

// Notification types
export const NOTIF_TYPES = {
  APPLICATION_UPDATE:  "application_update",
  ECS_CHANGE:          "ecs_change",
  INVESTOR_INTEREST:   "investor_interest",
  VERIFICATION_UPDATE: "verification_update",
  NEW_MATCH:           "new_match",
  MESSAGE:             "message",
  SESSION_BOOKED:      "session_booked",
  ESCROW_RELEASED:     "escrow_released",
  SAFETY_ALERT:        "safety_alert",
};