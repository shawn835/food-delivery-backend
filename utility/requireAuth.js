import { getAuthenticatedUser } from "../middleware/authSession.js";

export const requireAuth = async (req, res, next) => {
  const userId = await getAuthenticatedUser(req);
  if (!userId) {
    res.writeHead(401, { "Content-Type": "application/json" });
    res.end(JSON.stringify({ message: "Unauthorized" }));
    return;
  }

  next(userId);
};
