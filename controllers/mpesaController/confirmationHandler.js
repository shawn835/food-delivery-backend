import { parseReqBody } from "../../utility/parseReqBody.js";
import { handleSuccess, handleFailure } from "../../payment/mpesaUtils.js";
import { saveStkCallback } from "../../models/transactionModel.js";

export const confirmationHandler = async (req, res) => {
  try {
    const body = await parseReqBody(req);
    console.log("in confirmation handler Received body:", body); // Add this log
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

    await saveStkCallback(callback);

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
