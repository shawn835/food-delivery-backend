const allowedOrigin = process.env.FRONTEND_URL;

export const handleCORS = (req, res) => {
  res.setHeader("Access-Control-Allow-Origin", allowedOrigin); // Must be specific, not "*"
  res.setHeader("Access-Control-Allow-Credentials", "true"); // Important for cookies
  res.setHeader(
    "Access-Control-Allow-Methods",
    "POST, GET, PUT, DELETE, OPTIONS"
  );
  res.setHeader("Access-Control-Allow-Headers", "Content-Type");
};

export const handlePreflight = (req, res) => {
  if (req.method === "OPTIONS") {
    handleCORS(req, res);
    res.end();
    return true;
  }
  return false;
};
