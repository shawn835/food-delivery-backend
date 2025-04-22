import { generateAccessToken } from "./generateAccessToken.js";
import { generateSTKpassword, generateTimestamp } from "./mpesaUtils.js";
import { insertTransaction } from "../models/orderModel.js";

export const stkPushRequest = async ({ amount, phoneNumber, orderId }) => {
  try {
    const timestamp = generateTimestamp();
    const passkey = process.env.MPESA_PASSKEY;
    const shortcode = process.env.MPESA_SHORTCODE;
    const urlCallBack = process.env.MPESA_CALLBACK_URL;
    const password = generateSTKpassword(shortcode, passkey, timestamp);

    const payload = {
      BusinessShortCode: shortcode,
      Password: password,
      Timestamp: timestamp,
      TransactionType: "CustomerPayBillOnline",
      Amount: amount,
      PartyA: phoneNumber,
      PartyB: shortcode,
      PhoneNumber: phoneNumber,
      CallBackURL: urlCallBack,
      AccountReference: orderId, // ✅ helps trace which order this is for
      TransactionDesc: `Payment for order ${orderId}`,
    };

    const accessToken = await generateAccessToken();

    const response = await fetch(
      "https://sandbox.safaricom.co.ke/mpesa/stkpush/v1/processrequest",
      {
        method: "POST",
        headers: {
          Authorization: `Bearer ${accessToken}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify(payload),
      }
    );

    const data = await response.json();

    if (data.ResponseCode === "0") {
      // Optionally: Insert transaction into DB for tracking
      const transaction = {
        orderId,
        checkoutRequestID: data.CheckoutRequestID,
        merchantRequestID: data.MerchantRequestID,
        phoneNumber,
        amount,
        timestamp: new Date(),
        status: "pending",
      };

      await insertTransaction(transaction);
    }

    return data;
  } catch (error) {
    console.error("STK Push Error:", error);
    throw new Error("STK Push failed");
  }
};
