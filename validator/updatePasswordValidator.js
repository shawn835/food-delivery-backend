import { sanitizeInput } from "../utility/sanitization.js";

export const updatePasswordValidator = (reqBody) => {
  const errors = [];
  const clean = sanitizeInput(reqBody);

  const { newPassword, currentPassword, confirmPassword } = clean;

  if (!currentPassword || currentPassword.length < 6) {
    errors.push(
      "Current password is required and must be at least 6 characters."
    );
  }

  if (!newPassword || newPassword.length < 6) {
    errors.push("New password must be at least 6 characters long.");
  }

  // Validate password fields
  if (newPassword !== confirmPassword) {
    errors.push("Passwords do not match!");
  }

  return {
    isValid: errors.length === 0,
    errors,
    sanitizedData: clean,
  };
};
