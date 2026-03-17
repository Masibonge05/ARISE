// ARISE formatting utilities

/**
 * Format currency in ZAR
 * @param {number} amount
 * @param {boolean} compact - use abbreviations (1k, 2.5M)
 */
export function formatZAR(amount, compact = false) {
  if (amount === null || amount === undefined) return "—";
  if (compact) {
    if (amount >= 1_000_000) return `R${(amount / 1_000_000).toFixed(1)}M`;
    if (amount >= 1_000) return `R${(amount / 1_000).toFixed(0)}k`;
  }
  return `R${Number(amount).toLocaleString("en-ZA")}`;
}

/**
 * Format a date string to readable SA format
 */
export function formatDate(dateStr, opts = {}) {
  if (!dateStr) return "—";
  return new Date(dateStr).toLocaleDateString("en-ZA", {
    day: "numeric", month: "short", year: "numeric", ...opts,
  });
}

/**
 * Format relative time (e.g. "2h ago", "3d ago")
 */
export function timeAgo(dateStr) {
  if (!dateStr) return "";
  const diff = Date.now() - new Date(dateStr).getTime();
  const mins = Math.floor(diff / 60000);
  const hrs  = Math.floor(diff / 3600000);
  const days = Math.floor(diff / 86400000);
  if (mins < 1)  return "Just now";
  if (mins < 60) return `${mins}m ago`;
  if (hrs  < 24) return `${hrs}h ago`;
  if (days < 7)  return `${days}d ago`;
  return formatDate(dateStr);
}

/**
 * Get ECS band info for a score
 */
export function getECSBand(score) {
  const bands = [
    { min: 750, label: "Elite",       color: "#A8E6CF" },
    { min: 650, label: "Thriving",    color: "#4ECDC4" },
    { min: 500, label: "Established", color: "#FFD93D" },
    { min: 300, label: "Developing",  color: "#FF6B35" },
    { min: 0,   label: "Building",    color: "#888" },
  ];
  return bands.find(b => score >= b.min) || bands[bands.length - 1];
}

/**
 * Truncate text to a max length
 */
export function truncate(text, maxLen = 100) {
  if (!text) return "";
  return text.length > maxLen ? text.slice(0, maxLen) + "…" : text;
}

/**
 * Format SA phone number
 */
export function formatPhone(phone) {
  if (!phone) return "";
  const digits = phone.replace(/\D/g, "");
  if (digits.length === 10) return `${digits.slice(0,3)} ${digits.slice(3,6)} ${digits.slice(6)}`;
  if (digits.length === 11 && digits.startsWith("27")) return `+27 ${digits.slice(2,4)} ${digits.slice(4,7)} ${digits.slice(7)}`;
  return phone;
}

/**
 * Get initials from a name
 */
export function getInitials(firstName, lastName) {
  return `${(firstName || "?")[0]}${(lastName || "")[0] || ""}`.toUpperCase();
}

/**
 * Format file size
 */
export function formatFileSize(bytes) {
  if (!bytes) return "0 B";
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

/**
 * Capitalise first letter of each word
 */
export function titleCase(str) {
  if (!str) return "";
  return str.replace(/_/g, " ").replace(/\b\w/g, c => c.toUpperCase());
}

/**
 * Format match score with label
 */
export function matchLabel(score) {
  if (score >= 80) return { label: "High Match", color: "#4ECDC4" };
  if (score >= 60) return { label: "Good Match", color: "#FFD93D" };
  if (score >= 40) return { label: "Partial",    color: "#FF6B35" };
  return { label: "Low Match", color: "#888" };
}