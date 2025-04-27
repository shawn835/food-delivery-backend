import bcrypt from "bcrypt";
import { parseReqBody } from "../../utility/parseReqBody.js";
import { updatePasswordValidator } from "../../validator/updatePasswordValidator.js";
import { findUserById } from "../../models/userModel.js";
import { updateUserById } from "../../models/userModel.js";
import { requireAuth } from "../../utility/requireAuth.js";
export const updateUserPassword = async (req, res) => {
  requireAuth(req, res, async (userId) => {
    const reqBody = await parseReqBody(req);
    const { isValid, errors, sanitizedData } = updatePasswordValidator(reqBody);

    if (!isValid) {
      res.writeHead(400, { "Content-Type": "application/json" });
      res.end(JSON.stringify({ message: errors[0] }));
      return;
    }

    try {
      const { currentPassword, newPassword } = sanitizedData;

      const user = await findUserById(userId);
      const isMatch = await bcrypt.compare(currentPassword, user.password);

      if (!isMatch) {
        res.writeHead(403, { "Content-Type": "application/json" });
        res.end(JSON.stringify({ message: "Current password is incorrect" }));
        return;
      }

      const hashedPassword = await bcrypt.hash(newPassword, 10);
      await updateUserById(userId, { password: hashedPassword });

      res.writeHead(200, { "Content-Type": "application/json" });
      res.end(JSON.stringify({ message: "Password updated successfully" }));
    } catch (error) {
      console.log("Password update failed:", error);
      res.writeHead(500, { "Content-Type": "application/json" });
      res.end(JSON.stringify({ message: "Internal server error" }));
    }
  });
};
