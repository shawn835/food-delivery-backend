import { readCollection } from "../../config/readDb.js";
import { findUserById } from "../../models/userModel.js";
import { requireAuth } from "../../utility/requireAuth.js";

export const handleGetMe = async (req, res) => {
  requireAuth(req, res, async (userId) => {
    try {
      const sessionsDb = await readCollection("sessions");
      const session = await sessionsDb.findOne({ userId });

      if (!session) {
        res.writeHead(401, { "Content-Type": "application/json" });
        return res.end(JSON.stringify({ message: "unauthorized" }));
      }

      const owner = await findUserById(userId);
      if (!owner) {
        res.writeHead(404, { "Content-Type": "application/json" });
        return res.end(JSON.stringify({ message: "user not found" }));
      }

      const { password, ...safeUser } = owner;

      res.writeHead(200, { "Content-Type": "application/json" });
      res.end(JSON.stringify({ user: safeUser }));
    } catch (err) {
      console.log("error getting user: ", err);
      res.writeHead(500, { "Content-Type": "application/json" });
      res.end(JSON.stringify({ message: "internal server error" }));
    }
  });
};
