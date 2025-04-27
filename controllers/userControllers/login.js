import { parseReqBody } from "../../utility/parseReqBody.js";
import bcrypt from "bcrypt";
import { findUserByEmail } from "../../models/userModel.js";
import { createSession } from "../../middleware/manageSessions.js";
import { loginValidator } from "../../validator/loginValidator.js";
import {
  sendBadRequest,
  sendServerError,
  sendSuccess,
  sendUnauthorized,
} from "../../utility/sendResponse.js";

export const loginUser = async (req, res) => {
  try {
    const reqBody = await parseReqBody(req);
    const { isValid, errors, sanitizedData } = loginValidator(reqBody);

    if (!isValid) {
      return sendBadRequest(res, { message: errors[0] });
    }
    // Parse email & password
    const { email, password } = sanitizedData;

    const user = await findUserByEmail(email);
    if (!user) {
      return sendBadRequest(res, { message: "user not found" });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return sendUnauthorized(res, { message: "incorrect password" });
    }

    const { sessionId } = await createSession(user._id);

    if (sessionId) {
      const cookieOptions = [
        `sessionId=${sessionId}`,
        "HttpOnly",
        "Path=/",
        "Max-Age=3600",
        "SameSite=Lax",
      ];

      if (process.env.NODE_ENV === "production") {
        cookieOptions.push("Secure");
      }

      res.setHeader("Set-Cookie", cookieOptions.join("; "));
      res.setHeader("Access-Control-Allow-Origin", process.env.FRONTEND_URL);
      res.setHeader("Access-Control-Allow-Credentials", "true");
    }

    const safeUser = {
      id: user._id,
      email: user.email,
      name: user.name,
      phone: user.phone,
      address: user.address,
      city: user.city,
      role: user.role,
    };

    return sendSuccess(res, {
      message: "logged in successfully",
      owner: safeUser,
    });
  } catch (err) {
    console.error("login failed:", err);
    return sendServerError(res, { message: "internal server error" });
  }
};
