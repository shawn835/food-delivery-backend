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
    res.writeHead(204, {
      "Access-Control-Allow-Origin": allowedOrigin,
      "Access-Control-Allow-Credentials": "true",
      "Access-Control-Allow-Methods": "POST, GET, PUT, DELETE, OPTIONS",
      "Access-Control-Allow-Headers": "Content-Type",
    });
    res.end();
    return true;
  }
  return false;
};
