import { connectToDb } from "./db.js";

export const readCollection = async (collection) => {
  try {
    const db = await connectToDb();
    return db.collection(collection);
  } catch (error) {
    console.error(`Error getting collection ${collection}:`, error);
    throw new Error("Database error");
  }
};
