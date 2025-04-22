import { parseReqBody } from "../utility/parseReqBody.js";
import { readCollection } from "../config/readDb.js";
import { handleSuccess, handleFailure } from "./mpesaUtils.js";
const callBackCollection = await readCollection("transactions");

export const confirmationHandler = async (req, res) => {
  try {
    const body = await parseReqBody(req);
    const callback = body.Body?.stkCallback;
    if (!callback) {
      res.writeHead(400, {
        "Content-Type": "application/json",
        "Access-Control-Allow-Origin": "*",
      });
      res.end(JSON.stringify({ message: "Invalid callback data" }));
      return;
    }

    const { ResultCode, ResultDesc } = callback;

    console.log("STK Callback received:", {
      CheckoutRequestID: callback.CheckoutRequestID,
      ResultCode,
      ResultDesc,
    });

    await callBackCollection.insertOne({
      MerchantRequestID: callback.MerchantRequestID,
      CheckoutRequestID: callback.CheckoutRequestID,
      ResultCode,
      ResultDesc,
      receivedAt: new Date(),
    });

    if (ResultCode === 0) {
      await handleSuccess(callback);
    } else {
      await handleFailure(callback);
    }

    res.writeHead(200, {
      "Content-Type": "application/json",
      "Access-Control-Allow-Origin": "*",
    });
    res.end(JSON.stringify({ message: "Accepted!" }));
  } catch (error) {
    console.error("Error processing callback:", error);
    res.writeHead(500, {
      "Content-Type": "application/json",
      "Access-Control-Allow-Origin": "*",
    });
    res.end(JSON.stringify({ message: "Internal Server Error" }));
  }
};
