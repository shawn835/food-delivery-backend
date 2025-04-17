import { readCollection } from "../config/readDb.js";

export const createSession = async (userId) => {
  const sessionsCollection = await readCollection("sessions");

  const sessionId = Math.random().toString(36).substring(2);
  const createdAt = new Date();
  const expiresAt = new Date(createdAt.getTime() + 3600 * 1000);

  await sessionsCollection.insertOne({
    sessionId,
    userId,
    createdAt,
    expiresAt,
  });

  return { sessionId };
};

//check session validity
export const getSessionUser = async (sessionId) => {
  const sessionsCollection = await readCollection("sessions");
  const session = await sessionsCollection.findOne({
    sessionId,
    expiresAt: { $gt: new Date() },
  });

  return session ? session.userId : null;
};

export const createTTLIndex = async () => {
  try {
    const sessionsCollection = await readCollection("sessions");

    await sessionsCollection.createIndex(
      { expiresAt: 1 },
      { expireAfterSeconds: 0 }
    );

    console.log("TTL index created successfully");
  } catch (error) {
    console.error("Error creating TTL index:", error);
  }
};
