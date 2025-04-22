import { readCollection } from "../config/readDb.js";

export const findMealById = async (mealId) => {
  try {
    const menuCollection = await readCollection("menuData");
    const allMenus = await menuCollection.find().toArray();

    for (const menu of allMenus) {
      if (!Array.isArray(menu.categories)) continue;

      for (const category of menu.categories) {
        const found = category.meals.find((meal) => meal.id === mealId);
        if (found) return found;
      }
    }

    return null;
  } catch (err) {
    console.error("error finding meal:", err);
    throw err;
  }
};
