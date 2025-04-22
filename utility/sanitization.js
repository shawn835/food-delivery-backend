export const sanitizeInput = (input) => {
  if (typeof input === "string") {
    let value = input.trim();
    return value
      .replace(/<script.*?>.*?<\/script>/gi, "")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/'/g, "&#39;")
      .replace(/"/g, "&quot;")
      .replace(/\\/g, "")
      .replace(/&/g, "&amp;")
      .replace(/%/g, "%25")
      .replace(/;/g, "%3B")
      .replace(/,/g, "%2C")
      .replace(/=/g, "%3D")
      .replace(/:/g, "%3A")
      .replace(/!/g, "%21")
      .replace(/~/g, "%7E")
      .replace(/`/g, "%60")
      .replace(/#/g, "%23");
  }

  if (Array.isArray(input)) {
    return input.map(sanitizeInput);
  }

  if (typeof input === "object" && input !== null) {
    const sanitized = {};
    for (const key in input) {
      const value = input[key];

      if (
        typeof value === "string" &&
        !["email", "phone", "password", "confirmPassword"].includes(key)
      ) {
        sanitized[key] = sanitizeInput(value);
      } else if (typeof value === "object") {
        sanitized[key] = sanitizeInput(value);
      } else {
        sanitized[key] = value;
      }
    }
    return sanitized;
  }

  return input;
};

export const validateEmail = (email) => {
  if (typeof email !== "string") return false;

  const cleanedEmail = email.trim().toLowerCase();

  const regex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

  return regex.test(cleanedEmail);
};

export const validatePhoneNumber = (phone) => {
  if (typeof phone !== "string") return false;

  // Remove all whitespace
  const cleanedPhone = phone.replace(/\s+/g, "");

  //+2547x, +2541x, 07x, or 01x
  const regex = /^(?:\+254|0)(1\d{8}|7\d{8})$/;

  if (!regex.test(cleanedPhone)) return false;

  //correct length
  if (
    (cleanedPhone.startsWith("+254") && cleanedPhone.length !== 13) ||
    (!cleanedPhone.startsWith("+254") && cleanedPhone.length !== 10)
  ) {
    return false;
  }

  return true;
};

export const normalizedPhoneNumber = (phone) => {
  if (!phone) return "";

  const cleaned = phone.replace(/\s+/g, "");

  if (cleaned.startsWith("+254")) {
    return cleaned;
  } else if (cleaned.startsWith("0")) {
    return "+254" + cleaned.slice(1);
  } else {
    return "+254" + cleaned;
  }
};
