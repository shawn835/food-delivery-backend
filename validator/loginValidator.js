import { sanitizeInput, validateEmail } from "../utility/sanitization.js";

export const loginValidator = (reqBody) => {
  const errors = [];
  const clean = sanitizeInput(reqBody);

  const { email, password } = clean;
  if (!email || !validateEmail(email)) {
    errors.push("Invalid email format.");
  }
  if (!password || password.length < 6) {
    errors.push("Password must be at least 6 characters long.");
  }
  return {
    isValid: errors.length === 0,
    errors: errors,
    sanitizedData: clean,
  };
};
