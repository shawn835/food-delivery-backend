import { readCollection } from "../config/readDb.js";

const collectionName = "users";
export const createUser = async (userdata) => {
  try {
    const usersCollection = await readCollection(collectionName);
    await usersCollection.insertOne(userdata);
  } catch (err) {
    console.error("error creating user:", err);
    throw err;
  }
};

//find user by email
export const findUserByEmail = async (email) => {
  try {
    const usersCollection = await readCollection(collectionName);
    const user = await usersCollection.findOne({ email });
    return user;
  } catch (err) {
    console.error("error finding user by email:", err);
    throw err;
  }
};

export const findUserById = async (userId) => {
  try {
    const usersCollection = await readCollection("users");
    const user = await usersCollection.findOne({ _id: userId });
    return user;
  } catch (err) {
    console.error("Error finding user by ID:", err);
    throw err;
  }
};

export const updateUserById = async (userId, updateData) => {
  try {
    const usersCollection = await readCollection("users");
    const result = await usersCollection.updateOne(
      { _id: userId },
      { $set: updateData }
    );
    return result.modifiedCount > 0;
  } catch (err) {
    console.error("Error updating user:", err);
    throw err;
  }
};

export const findUserByPhone = async (phoneNumber) => {
  try {
    const usersCollection = await readCollection("users");
    const user = await usersCollection.findOne({ phoneNumber });
    return user;
  } catch (err) {
    console.error("Error finding user by phone:", err);
    throw err;
  }
};

// Delete a user
export const deleteUser = async (email) => {
  try {
    const collection = await readCollection(collectionName);
    const result = await collection.deleteOne({ email });
    return result.deletedCount > 0;
  } catch (err) {
    console.error("Error deleting user:", error);
    throw err;
  }
};
