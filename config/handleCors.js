import dotenv from "dotenv";
dotenv.config();
const allowedOrigin = process.env.FRONTEND_URL;

export const handleCORS = (req, res) => {
  res.setHeader("Access-Control-Allow-Origin", allowedOrigin);
  res.setHeader("Access-Control-Allow-Credentials", "true");
  res.setHeader(
    "Access-Control-Allow-Methods",
    "POST, GET, PUT, DELETE, OPTIONS, HEAD"
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
