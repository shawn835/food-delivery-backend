import { readCollection } from "../config/readDb.js";
const collectionName = "orders";

export const insertOrder = async (order) => {
  try {
    const ordersCollection = await readCollection(collectionName);
    const result = await ordersCollection.insertOne(order);
    return result;
  } catch (err) {
    console.error("Error inserting order:", err);
    throw err;
  }
};

export const insertTempOrder = async (tempOrder) => {
  try {
    const tempOrderCollection = await readCollection("temporaryOrders");
    const result = await tempOrderCollection.insertOne(tempOrder);
    return result;
  } catch (err) {
    console.error("Error inserting order:", err);
    throw err;
  }
};
export const insertTransaction = async (transaction) => {
  try {
    const transactionCollection = await readCollection("transaction");
    const result = await transactionCollection.insertOne(transaction);
    return result;
  } catch (err) {
    console.error("Error inserting order:", err);
    throw err;
  }
};

export const findOrderById = async (orderId) => {
  try {
    const ordersCollection = await readCollection(collectionName);
    const order = await ordersCollection.findOne({ _id: orderId });
    return order;
  } catch (err) {
    console.error("Error finding order by ID:", err);
    throw err;
  }
};
