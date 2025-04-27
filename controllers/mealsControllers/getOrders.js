import { parseReqBody } from "../../utility/parseReqBody.js";
import { readCollection } from "../../config/readDb.js";
export const getOrders = async (req, res) => {
  try {
    const reqBody = await parseReqBody(req);
    const { page, perPage, filters } = reqBody;

    const { searchQuery } = filters;

    let filterConditions = {};

    if (searchQuery) {
      filterConditions.$or = [
        { orderId: { $regex: searchQuery, $options: "i" } },
        { "user.phone": { $regex: searchQuery, $options: "i" } },
        { status: { $regex: searchQuery, $options: "i" } },
      ];
    }

    const orderCollection = await readCollection("temporaryOrders");
    const orders = await orderCollection
      .find(filterConditions)
      .skip((page - 1) * perPage)
      .limit(perPage)
      .toArray();

    const totalOrders = await orderCollection.countDocuments(filterConditions);
    const totalPages = Math.ceil(totalOrders / perPage);

    res.writeHead(200, { "Content-Type": "application/json" });
    res.end(JSON.stringify({ orders, totalPages }));
  } catch (error) {
    console.error("getting orders failed:", error);
    res.writeHead(500, { "Content-Type": "application/json" });
    res.end(JSON.stringify({ message: "internal server error" }));
  }
};
