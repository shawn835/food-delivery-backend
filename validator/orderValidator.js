import { sanitizeInput } from "../utility/sanitization.js";

export const validateOrder = (order) => {
  const errors = [];
  const { items, payment, notes, delivery } = sanitizeInput(order);

  if (!Array.isArray(items) || items.length === 0) {
    errors.push("Order must contain at least one item");
  } else {
    items.forEach((item, index) => {
      if (!item.itemId || typeof item.itemId !== "string") {
        errors.push(
          `Item ${index + 1}: itemId is required and must be a string`
        );
      }
      if (item.name && typeof item.name !== "string") {
        errors.push(`Item ${index + 1}: name must be a string`);
      }
      if (typeof item.quantity !== "number" || item.quantity < 1) {
        errors.push(`Item ${index + 1}: quantity must be at least 1`);
      }
      if (typeof item.price !== "number" || item.price < 0) {
        errors.push(`Item ${index + 1}: price must be a non-negative number`);
      }
      if (
        item.subtotal !== undefined &&
        (typeof item.subtotal !== "number" || item.subtotal < 0)
      ) {
        errors.push(
          `Item ${
            index + 1
          }: subtotal must be a non-negative number if provided`
        );
      }
      // if (item.notes && typeof item.notes !== "string") {
      //   errors.push(`Item ${index + 1}: notes must be a string if provided`);
      // }
    });
  }

  if (payment) {
    const { method, amount, status, deliveryFee } = payment;

    const allowedMethods = ["mpesa", "cash on delivery", "airtel money"];
    const normalizedMethod = method?.toLowerCase();
    if (
      !allowedMethods.map((m) => m.toLowerCase()).includes(normalizedMethod)
    ) {
      errors.push(
        `Payment method must be one of the following: ${allowedMethods.join(
          ", "
        )}`
      );
    }

    if (typeof amount !== "number" || amount <= 0) {
      errors.push("Payment amount must be a positive number");
    }
    if (!status || typeof status !== "string" || status.length < 3) {
      errors.push("Payment status must be at least 3 characters long");
    }
    if (typeof deliveryFee !== "number" || deliveryFee < 0) {
      errors.push("Delivery fee must be a non-negative number");
    }
  } else {
    errors.push("Payment object is required");
  }

  if (delivery) {
    if (typeof delivery !== "object") {
      errors.push("Delivery must be an object if provided");
    } else {
      const { address, deliveryNotes } = delivery;
      if (!address || typeof address !== "string" || address.length < 5) {
        errors.push("Delivery address must be at least 5 characters long");
      }
      if (deliveryNotes && typeof deliveryNotes !== "string") {
        errors.push("Delivery instructions must be a string if provided");
      }
    }
  } else {
    errors.push("Delivery object is required");
  }

  return {
    isValid: errors.length === 0,
    errors,
    sanitizedData: order,
  };
};
