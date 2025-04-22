import moment from "moment";
import { readCollection } from "../config/readDb.js";
import { insertOrder } from "../models/orderModel.js";
export const generateTimestamp = () => moment().format("YYYYMMDDHHmmss");

export const generateSTKpassword = (shortcode, passkey, timestamp) => {
  return Buffer.from(`${shortcode}${passkey}${timestamp}`).toString("base64");
};

export const handleSuccess = async (callback) => {
  const { CheckoutRequestID, CallbackMetadata } = callback;
  const metadata = CallbackMetadata.Item.reduce((acc, item) => {
    acc[item.Name] = item.Value;
    return acc;
  }, {});

  const transactionCollection = readCollection("transaction");
  const transaction = await (
    await transactionCollection
  ).findOne({ checkoutRequestID: CheckoutRequestID });

  if (!transaction) {
    console.error(
      `no matching transaction for checkoutRequestId: ${CheckoutRequestID}`
    );

    throw new Error(
      `no matching transaction for checkoutRequestId: ${CheckoutRequestID}`
    );
  }

  const tempOrderCollection = await readCollection("temporaryOrders");
  const tempOrder = await tempOrderCollection.findOne({
    orderId: transaction.orderId,
  });

  if (!tempOrder) {
    console.error(
      "no matching temporary order found for orderId:",
      transaction.orderId
    );

    throw new Error(
      "no matching temporary order found for orderId:",
      transaction.orderId
    );
  }

  const finalizedOrder = {
    ...tempOrder,
    payment: {
      ...tempOrder.payment,
      status: "paid",
    },
    metadata: {
      mpesaReceiptNumber: metadata.MpesaReceiptNumber,
      transactionDate: metadata.TransactionDate,
    },
    timestamps: {
      createdAt: new Date(),
      updatedAt: new Date(),
      estimatedDelivery: null,
    },
    orderStatus: "confirmed",
  };

  await insertOrder(finalizedOrder);

  await (
    await transactionCollection
  ).updateOne(
    { CheckoutRequestID },
    { $set: { status: "success", completedAt: new Date() } }
  );

  console.log(
    `Payment successful for order ${transaction.orderId}: ${metadata.MpesaReceiptNumber}`
  );

  //delete temp order
  await tempOrderCollection.deleteOne({ orderId: transaction.orderId });
  //  send notifications here
};

export const handleFailure = async (callback) => {
  const { CheckoutRequestID, ResultCode, ResultDesc } = callback;

  const failureReasons = {
    1032: "Payment canceled. Try again or use cash.",
    1037: "Wrong M-Pesa PIN. Please try again.",
    2001: "Not enough funds in M-Pesa. Top up or use another method.",
    1031: "Payment timed out. Please try again.",
    1: "M-Pesa system error. Try again later.",
    17: "Invalid M-Pesa number. Update your phone number.",
  };

  const readableError =
    failureReasons[ResultCode] || `Payment failed: ${ResultDesc}`;

  const transactionCollection = await readCollection("transaction");

  const transaction = await transactionCollection.findOne({
    checkoutRequestID: CheckoutRequestID,
  });

  if (!transaction) {
    console.error(
      "No matching transaction for checkoutRequestID:",
      CheckoutRequestID
    );
    throw new Error(
      `No matching transaction for checkoutRequestID: ${CheckoutRequestID}`
    );
  }

  // Update transaction status to failed
  await transactionCollection.updateOne(
    { checkoutRequestID: CheckoutRequestID },
    {
      $set: {
        status: "failed",
        resultDescription: readableError,
        failedAt: new Date(),
      },
    }
  );

  const tempOrderCollection = await readCollection("temporaryOrders");

  // Mark temp order as failed
  await tempOrderCollection.updateOne(
    { orderId: transaction.orderId },
    {
      $set: {
        orderStatus: "payment_failed",
        "payment.status": "failed",
        "payment.error": readableError,
      },
    }
  );

  console.log(
    `Payment failed for order ${transaction.orderId}: ${readableError}`
  );

  // Optionally delete the temp order
  await tempOrderCollection.deleteOne({ orderId: transaction.orderId });
};
