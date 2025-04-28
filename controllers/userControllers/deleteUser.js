import { deleteUser, findUserById } from "../../models/userModel.js";
import { requireAuth } from "../../utility/requireAuth.js";

export const deleteUserAccount = async (req, res) => {
  await requireAuth(req, res, async (userId) => {
    try {
      const user = await findUserById(userId);

      if (!user || !user.email) {
        res.writeHead(404, { "Content-Type": "application/json" });
        res.end(JSON.stringify({ message: "User not found" }));
        return;
      }

      const deleted = await deleteUser(user.email);

      if (deleted) {
        res.writeHead(200, { "Content-Type": "application/json" });
        res.end(JSON.stringify({ message: "User deleted successfully" }));
      } else {
        res.writeHead(500, { "Content-Type": "application/json" });
        res.end(JSON.stringify({ message: "Failed to delete user" }));
      }
    } catch (error) {
      console.error("Error deleting user:", error);
      res.writeHead(500, { "Content-Type": "application/json" });
      res.end(JSON.stringify({ message: "Internal server error" }));
    }
  });
};
