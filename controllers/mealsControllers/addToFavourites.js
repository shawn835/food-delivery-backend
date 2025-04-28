import { requireAuth } from "../../utility/requireAuth.js";
import { parseReqBody } from "../../utility/parseReqBody.js";
import {
  sendBadRequest,
  sendCreated,
  sendServerError,
  sendSuccess,
} from "../../utility/sendResponse.js";

import {
  findMealById,
  addMealTofavourites,
  removeMealFromFavourites,
  findFavouriteMeal,
} from "../../models/mealModel.js";

export const toggleFavouriteMeal = async (req, res) => {
  await requireAuth(req, res, async (userId) => {
    try {
      const { mealId } = await parseReqBody(req);

      if (!mealId) return sendBadRequest(res, { message: "Meal ID required" });

      const actualMeal = await findMealById(mealId);
      if (!actualMeal)
        return sendBadRequest(res, { message: "Meal does not exist" });

      const favourite = await findFavouriteMeal(userId, mealId);

      if (favourite) {
        await removeMealFromFavourites(userId, mealId);
        return sendSuccess(res, { message: "removed from favourites" });
      }

      await addMealTofavourites(userId, mealId);
      return sendCreated(res, { message: "meal added to favourites" });
    } catch (error) {
      console.error("Error toggling favourite:", error);
      return sendServerError(res, { message: "Internal server error" });
    }
  });
};
