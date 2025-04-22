import {
  sanitizeInput,
  validateEmail,
  validatePhoneNumber,
  normalizedPhoneNumber,
} from "../utility/sanitization.js";

export const registerValidator = (reqBody) => {
  const error = [];
  const clean = sanitizeInput(reqBody);
  const { name, email, password, phoneNumber, address, city } = clean;

  if (!name || name.length < 3) {
    error.push("Name must be at least 3 characters long.");
  }

  if (!email || !validateEmail(email)) {
    error.push("Invalid email format.");
  }

  if (!password || password.length < 6) {
    console.log("checkig password", password);

    error.push("Password must be at least 6 characters long.");
  }

  if (!phoneNumber || !validatePhoneNumber(phoneNumber)) {
    error.push("Invalid phone number format.");
  }

  if (!address || address.length < 5) {
    error.push("Address must be at least 5 characters long.");
  }
  if (!city || city.length < 3) {
    error.push("City must be at least 3 characters long.");
  }

  return {
    isValid: error.length === 0,
    errors: error,
    sanitizedData: {
      ...clean,
      phone: normalizedPhoneNumber(phoneNumber),
    },
  };
};
