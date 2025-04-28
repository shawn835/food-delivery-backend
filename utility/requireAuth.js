import { getAuthenticatedUser } from "../middleware/authSession.js";
import { sendUnauthorized } from "./sendResponse.js";

export const requireAuth = async (req, res, onAuthSuccess) => {
  const userId = await getAuthenticatedUser(req);
  if (!userId) {
    return sendUnauthorized(res, { message: "Unauthorized" });
  }
  onAuthSuccess(userId);
};
