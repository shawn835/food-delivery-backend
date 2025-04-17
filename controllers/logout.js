import cookie from "cookie";
import { readCollection } from "../config/readDb.js";

export const logoutUser = async (req, res) => {
  const cookies = cookie.parse(req.headers.cookie || "");
  const sessionId = cookies.sessionId;
  console.log(sessionId);

  if (!sessionId) {
    res.writeHead(400, { "Content-Type": "application/json" });
    res.end(JSON.stringify({ message: "No active session found" }));
    return;
  }

  try {
    const sessionsCollection = await readCollection("sessions");

    // Delete session
    console.log(`deleting session, ${sessionId}`);

    const deletedSession = await sessionsCollection.deleteOne({ sessionId });
    // Delete session
    console.log(`deleted session, ${sessionId}`);
    if (deletedSession.deletedCount === 0) {
      console.log(`No session found with sessionId: ${sessionId}`);
    } else {
      console.log(`Session ${sessionId} successfully deleted.`);
    }

    res.writeHead(200, {
      "Set-Cookie": `sessionId=; HttpOnly; Path=/; Max-Age=0`,
      "Content-Type": "application/json",
    });
    res.end(JSON.stringify({ message: "Logged out successfully" }));
  } catch (err) {
    console.log("Logout failed:", err);
    res.writeHead(500, { "Content-Type": "application/json" });
    res.end(JSON.stringify({ message: "Internal server error" }));
  }
};
