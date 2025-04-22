import { parseReqBody } from "../utility/parseReqBody.js";
import { getAuthenticatedUser } from "../controllers/authSession.js";
import { insertTempOrder } from "../models/orderModel.js";
import { validateOrder } from "../validator/orderValidator.js";
import { generateOrderId } from "../menu/generateOrderId.js";
import { findMealById } from "../models/mealModel.js";
import { stkPushRequest } from "../payment/stkPush.js";
import { normalizedPhoneNumber } from "../utility/sanitization.js";
// Sanitize and verify order on backend

export const createOrder = async (req, res) => {
  try {
    const userId = await getAuthenticatedUser(req);

    if (!userId) {
      res.writeHead(401, { "Content-Type": "application/json" });
      return res.end(JSON.stringify({ message: "Unauthorized" }));
    }

    const reqBody = await parseReqBody(req);
    const { isValid, errors, sanitizedData } = validateOrder(reqBody);

    if (!isValid) {
      res.writeHead(400, { "Content-Type": "application/json" });
      return res.end(JSON.stringify({ message: errors[0] }));
    }

    const { items, payment, notes, delivery } = sanitizedData;

    // Recalculate item subtotals and validate prices
    const validatedItems = [];
    let recalculatedSubtotal = 0;

    for (const item of items) {
      const meal = await findMealById(item.itemId);

      if (!meal) {
        res.writeHead(400, { "Content-Type": "application/json" });
        return res.end(
          JSON.stringify({ message: `Invalid meal ID: ${item.itemId}` })
        );
      }

      const quantity = parseInt(item.quantity);
      const price = parseFloat(meal.price);
      const subtotal = price * quantity;

      validatedItems.push({
        itemId: item.itemId,
        name: meal.mealName,
        quantity,
        price,
        subtotal,
      });

      recalculatedSubtotal += subtotal;
    }

    // Calculate fees and total amount
    const taxRate = 0.08; // 8% tax rate
    const deliveryFee = 100; // fixed delivery fee
    const tip = payment.tip || 10;

    const tax = Math.round(recalculatedSubtotal * taxRate);
    const totalAmount = Math.round(
      recalculatedSubtotal + tax + deliveryFee + tip
    );

    const temporaryOrder = {
      customerId: userId,
      orderId: generateOrderId(),
      items: validatedItems,
      payment: {
        method: payment.method,
        amount: totalAmount,
        status: "pending",
        tax,
        deliveryFee,
        tip,
        currency: payment.currency || "USD",
        phoneNumber: delivery.phoneNumber,
      },
      notes,
      delivery,
      timestamp: {
        createdAt: new Date(),
      },
      orderStatus: "pending",
    };

    await insertTempOrder(temporaryOrder);

    res.writeHead(200, { "Content-Type": "application/json" });
    res.end(
      JSON.stringify({
        message: "Order placed. Proceeding with payment.",
        orderId: temporaryOrder.orderId,
      })
    );

    const sanitizePhoneNumber = (phone) => {
      const normal = normalizedPhoneNumber(phone); //convert it to +254...
      const sanitizedPhoneNumber = normal.replace(/^\+/, ""); //remove +
      return sanitizedPhoneNumber;
    };

    await stkPushRequest({
      amount: totalAmount,
      phoneNumber: sanitizePhoneNumber(delivery.phone),
      orderId: temporaryOrder.orderId,
    });
  } catch (err) {
    console.error("Error creating order:", err);
    res.writeHead(500, { "Content-Type": "application/json" });
    res.end(JSON.stringify({ message: "Internal server error" }));
  }
};
