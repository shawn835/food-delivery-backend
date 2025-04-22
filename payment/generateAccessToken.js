import dotenv from "dotenv";
const consumerKey = process.env.CONSUMER_KEY;
const consumerSecret = process.env.CONSUMER_SECRET_KEY;
const auth = Buffer.from(`${consumerKey}:${consumerSecret}`).toString("base64");

dotenv.config();
const url =
  "https://sandbox.safaricom.co.ke/oauth/v1/generate?grant_type=client_credentials";

export const generateAccessToken = async () => {
  try {
    const response = await fetch(url, {
      method: "GET",
      headers: {
        Authorization: `Basic ${auth}`,
        "Content-Type": "application/json",
      },
    });

    const data = await response.json();

    if (response.ok) {
      return data.access_token;
    } else {
      throw new Error(
        `Failed to generate access token: ${JSON.stringify(data)}`
      );
    }
  } catch (error) {
    console.error("Error generating access token:", error.message);
    throw error;
  }
};
