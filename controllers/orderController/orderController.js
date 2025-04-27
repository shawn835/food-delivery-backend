import { parseReqBody } from "../../utility/parseReqBody.js";
import { getAuthenticatedUser } from "../../middleware/authSession.js";
import { insertTempOrder } from "../../models/orderModel.js";
import { validateOrder } from "../../validator/orderValidator.js";
import { generateOrderId } from "../../utility/generateOrderId.js";
import { findMealById } from "../../models/mealModel.js";
import { stkPushRequest } from "../../payment/stkPush.js";
import { normalizedPhoneNumber } from "../../utility/sanitization.js";
import {
  sendSuccess,
  sendUnauthorized,
  sendServerError,
  sendBadRequest,
} from "../../utility/sendResponse.js";
// Sanitize and verify order on backend

export const createOrder = async (req, res) => {
  try {
    const userId = await getAuthenticatedUser(req);

    if (!userId) {
      return sendUnauthorized(res, { message: "unauthorized" });
    }

    const reqBody = await parseReqBody(req);
    const { isValid, errors, sanitizedData } = validateOrder(reqBody);

    if (!isValid) {
      return sendBadRequest(res, { message: errors[0] });
    }

    const { items, payment, notes, delivery } = sanitizedData;

    // Recalculate item subtotals and validate prices
    const validatedItems = [];
    let recalculatedSubtotal = 0;

    for (const item of items) {
      const meal = await findMealById(item.itemId);

      if (!meal) {
        return sendBadRequest(res, {
          message: `Invalid meal ID: ${item.itemId}`,
        });
      }

      const quantity = parseInt(item.quantity);
      const price = parseFloat(meal.price);
      const subtotal = price * quantity;

      validatedItems.push({
        itemId: item.itemId,
        name: meal.mealName,
        imageUrl: meal.mealImage,
        quantity,
        price,
        subtotal,
      });

      recalculatedSubtotal += subtotal;
    }

    // Calculate fees and total amount
    const deliveryFee = 100; // fixed delivery fee

    const totalAmount = Math.round(recalculatedSubtotal + deliveryFee);

    const temporaryOrder = {
      customerId: userId,
      orderId: generateOrderId(),
      items: validatedItems,
      payment: {
        method: payment.method,
        amount: totalAmount,
        status: "pending",
        deliveryFee,
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

    if (temporaryOrder) {
      return sendSuccess(res, {
        message: "Order placed. Proceeding with payment.",
        orderId: temporaryOrder.orderId,
      });
    }

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
    return sendServerError(res, { message: "Internal server error" });
  }
};
