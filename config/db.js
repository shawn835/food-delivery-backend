import { MongoClient } from "mongodb";
import dotenv from "dotenv";
dotenv.config();

const uri = process.env.MONGO_URI;
if (!uri) throw new Error("MONGO_URI is not defined");

const client = new MongoClient(uri);

let isConnected = false;

export const connectToDb = async () => {
  try {
    if (!isConnected) {
      await client.connect();
      isConnected = true;
      console.log("Connected to MongoDB");

      const db = client.db(process.env.MONGO_DB_NAME);

      const usersCollection = db.collection("users");

      // Create unique index for phone number and email
      await usersCollection.createIndex({ phone: 1 }, { unique: true });

      await usersCollection.createIndex({ email: 1 }, { unique: true });

      console.log("Indexes ensured on phone and email");
    }
    return client.db(process.env.MONGO_DB_NAME);
  } catch (error) {
    console.error("Error connecting to MongoDB:", error);
    throw error;
  }
};

// Graceful shutdown
process.on("SIGINT", async () => {
  await client.close();
  console.log("MongoDB connection closed");
  process.exit(0);
});
