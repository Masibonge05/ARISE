// ARISE client-side validators

/**
 * Validate South African ID number (13 digits, Luhn check)
 */
export function isValidSAID(id) {
  if (!id || !/^\d{13}$/.test(id.trim())) return false;
  const digits = id.trim().split("").map(Number);
  // Luhn algorithm
  let sum = 0;
  for (let i = 0; i < 12; i++) {
    if (i % 2 === 0) {
      sum += digits[i];
    } else {
      const d = digits[i] * 2;
      sum += d > 9 ? d - 9 : d;
    }
  }
  const check = (10 - (sum % 10)) % 10;
  return check === digits[12];
}

/**
 * Validate SA mobile number
 */
export function isValidSAPhone(phone) {
  const digits = phone?.replace(/\D/g, "") || "";
  if (digits.length === 10 && digits.startsWith("0")) return true;
  if (digits.length === 11 && digits.startsWith("27")) return true;
  return false;
}

/**
 * Validate email address
 */
export function isValidEmail(email) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email || "");
}

/**
 * Validate password strength (min 8 chars, 1 upper, 1 number)
 */
export function validatePassword(password) {
  const errors = [];
  if (!password || password.length < 8) errors.push("At least 8 characters");
  if (!/[A-Z]/.test(password)) errors.push("At least 1 uppercase letter");
  if (!/[0-9]/.test(password)) errors.push("At least 1 number");
  return { valid: errors.length === 0, errors };
}

/**
 * Validate CIPC registration number (e.g. 2024/123456/07)
 */
export function isValidCIPC(reg) {
  return /^\d{4}\/\d{6}\/\d{2}$/.test(reg?.trim() || "");
}

/**
 * Check if a file is an allowed document type
 */
export function isAllowedDocType(file, types = ["image/jpeg","image/png","application/pdf"]) {
  return types.includes(file?.type);
}

/**
 * Check if file size is within limit (default 10MB)
 */
export function isFileSizeOK(file, maxMB = 10) {
  return file?.size <= maxMB * 1024 * 1024;
}

/**
 * Required field check
 */
export function isRequired(value) {
  return value !== null && value !== undefined && String(value).trim().length > 0;
}