import {
  updateUserById,
  findUserByEmail,
  findUserById,
  findUserByPhone,
} from "../models/userModel.js";
import { getAuthenticatedUser } from "./authSession.js";
import bcrypt from "bcrypt";
import { parseReqBody } from "../utility/parseReqBody.js";

export const updateUserAccount = async (req, res) => {
  const userId = await getAuthenticatedUser(req);

  if (!userId) {
    res.writeHead(401, { "Content-Type": "application/json" });
    res.end(JSON.stringify({ message: "Unauthorized" }));
    return;
  }

  try {
    const { name, email, phoneNumber, password } = await parseReqBody(req);

    if (!name || !email || !phoneNumber || !password) {
      res.writeHead(400, { "Content-Type": "application/json" });
      res.end(JSON.stringify({ message: "All fields are required" }));
      return;
    }

    const currentUser = findUserById(userId);

    if (email !== currentUser.email) {
      const existingUser = await findUserByEmail(email);
      if (existingUser) {
        res.writeHead(409, { "Content-Type": "application/json" });
        res.end(
          JSON.stringify({ message: "Cannot update, the phone is in use" })
        );
        return;
      }
    }

    if (phoneNumber && phoneNumber !== currentUser.phoneNumber) {
      const existingUser = await findUserByPhone(phoneNumber);
      if (existingUser) {
        res.writeHead(409, { "Content-Type": "application/json" });
        res.end(
          JSON.stringify({ message: "Cannot update, the email is in use" })
        );
        return;
      }
    }

    const updatedFields = { name, email, phoneNumber };

    if (password) {
      const hashedPassword = await bcrypt.hash(password, 10);
      updatedFields.password = hashedPassword;
    }

    const updateResult = await updateUserById(userId, updatedFields);

    if (updateResult) {
      res.writeHead(200, { "Content-Type": "application/json" });
      res.end(JSON.stringify({ message: "User updated successfully" }));
    } else {
      res.writeHead(404, { "Content-Type": "application/json" });
      res.end(JSON.stringify({ message: "User not found" }));
    }
  } catch (error) {
    console.log("Update user failed:", error);
    res.writeHead(500, { "Content-Type": "application/json" });
    res.end(JSON.stringify({ message: "Internal server error" }));
  }
};
