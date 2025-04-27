import cookie from "cookie";
import { getSessionUser } from "./manageSessions.js";

// Function to retrieve authenticated user based on sessionId in cookie
export const getAuthenticatedUser = async (req) => {
  const cookies = cookie.parse(req.headers.cookie || "");

  const sessionId = cookies.sessionId;

  if (!sessionId) {
    console.log("Session ID not found in cookies.");
    return null;
  }
  const userId = await getSessionUser(sessionId);
  if (!userId) {
    return null;
  }

  return userId;
};
