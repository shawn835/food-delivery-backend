import { readCollection } from "../config/readDb.js";

export const saveStkCallback = async (callback) => {
  const collection = await readCollection("transactions");
  await collection.insertOne({
    MerchantRequestID: callback.MerchantRequestID,
    CheckoutRequestID: callback.CheckoutRequestID,
    ResultCode: callback.ResultCode,
    ResultDesc: callback.ResultDesc,
    receivedAt: new Date(),
  });
};
