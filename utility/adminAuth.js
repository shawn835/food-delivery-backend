import { getAuthenticatedUser } from "../middleware/authSession.js";
import { findUserById } from "../models/userModel.js";

export const requireAdmin = async (req, res, next) => {
  const userId = await getAuthenticatedUser(req);
  const user = await findUserById(userId);

  if (!user || user.role !== "admin") {
    res.writeHead(403, { "Content-Type": "application/json" });
    return res.end(JSON.stringify({ message: "Forbidden" }));
  }

  next(user);
};
