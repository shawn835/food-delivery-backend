import { parseReqBody } from "../utility/utils.js";
import bcrypt from "bcrypt";
import { findUserByEmail } from "../models/userModel.js";
import { createSession } from "./manageSessions.js";

export const loginUser = async (req, res) => {
  try {
    // Parse email & password
    const { email, password } = await parseReqBody(req);

    const user = await findUserByEmail(email);
    if (!user) {
      res.writeHead(401, {
        "Content-Type": "application/json",
      });
      res.end(JSON.stringify({ message: "user not found" }));
      return;
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      res.writeHead(401, {
        "Content-Type": "application/json",
      });
      res.end(JSON.stringify({ message: "incorrect password" }));
      return;
    }

    const { sessionId } = await createSession(user._id);

    // Set cookie with cross-site options
    res.writeHead(200, {
      // Secure: true ONLY if you're on HTTPS (for dev use false)
      "Set-Cookie": `sessionId=${sessionId}; HttpOnly; Path=/; Max-Age=3600; SameSite=Lax`,
      // Add Secure if in production:
      // "Set-Cookie": `sessionId=${sessionId}; HttpOnly; Path=/; Max-Age=3600; SameSite=Lax; Secure`,

      // CORS header: allow cookie to be received on frontend
      "Access-Control-Allow-Origin": "http://localhost:3000", // your frontend URL
      "Access-Control-Allow-Credentials": "true",

      "Content-Type": "application/json",
    });

    res.end(JSON.stringify({ message: "logged in successfully" }));
  } catch (err) {
    console.error("login failed:", err);
    res.writeHead(500, { "Content-Type": "application/json" });
    res.end(JSON.stringify({ message: "internal server error" }));
  }
};
