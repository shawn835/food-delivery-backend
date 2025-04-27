import { readCollection } from "../../config/readDb.js";
import { getAuthenticatedUser } from "../../middleware/authSession.js";

export const handleOrderHistory = async (req, res) => {
  const userId = await getAuthenticatedUser(req);
  if (!userId) {
    res.writeHead(401, { "Content-Type": "application/json" });
    return res.end(JSON.stringify({ message: "unauthorized" }));
  }

  try {
    const ordersCollection = await readCollection("temporaryOrders");
    const userOrders = await ordersCollection
      .find({ customerId: userId })
      .toArray();

    if (!userOrders.length) {
      res.writeHead(404, { "Content-Type": "application/json" });
      return res.end(JSON.stringify({ message: "no orders found." }));
    } else {
      res.writeHead(200, { "Content-Type": "application/json" });
      res.end(JSON.stringify({ userOrders }));
    }
  } catch (error) {
    res.writeHead(500, { "Content-Type": "application/json" });
    res.end(JSON.stringify({ message: "Server error.", error: error.message }));
  }
};
