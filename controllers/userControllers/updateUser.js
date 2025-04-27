import {
  updateUserById,
  findUserByEmail,
  findUserById,
  findUserByPhone,
} from "../../models/userModel.js";
import { parseReqBody } from "../../utility/parseReqBody.js";
import { updateAccountValidator } from "../../validator/updateUserAccountValidator.js";
import { requireAuth } from "../../utility/requireAuth.js";

export const updateUserAccount = async (req, res) => {
  requireAuth(req, res, async (userId) => {
    try {
      const reqBody = await parseReqBody(req);
      const { isValid, errors, sanitizedData } =
        updateAccountValidator(reqBody);

      if (!isValid) {
        res.writeHead(400, { "Content-Type": "application/json" });
        return res.end(JSON.stringify({ message: errors[0] }));
      }

      const currentUser = await findUserById(userId);

      if (!currentUser) {
        res.writeHead(404, { "Content-Type": "application/json" });
        return res.end(JSON.stringify({ message: "User not found" }));
      }

      const { phone, address, city, email, name } = sanitizedData;

      if (email !== currentUser.email) {
        const existingUser = await findUserByEmail(email);
        if (existingUser) {
          res.writeHead(409, { "Content-Type": "application/json" });
          res.end(
            JSON.stringify({ message: "Cannot update, the email is in use" })
          );
          return;
        }
      }

      if (phone && phone !== currentUser.phone) {
        const existingUser = await findUserByPhone(phone);
        if (existingUser) {
          res.writeHead(409, { "Content-Type": "application/json" });
          res.end(
            JSON.stringify({
              message: "Cannot update, the phone number is in use",
            })
          );
          return;
        }
      }

      const updatedFields = { name, email, phone, address, city };

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
  });
};
