import {
  getAllMenuTypes,
  getCategoriesByMenuTypeSlug,
  getMealsByCategorySlug,
} from "../../models/mealModel.js";
import {
  sendBadRequest,
  sendServerError,
  sendSuccess,
} from "../../utility/sendResponse.js";

export const getMenuTypes = async (req, res) => {
  try {
    const types = await getAllMenuTypes();

    return sendSuccess(res, { types });
  } catch (error) {
    console.error("Error fetching menu types:", error);
    return sendServerError(res, { message: "Internal Server Error" });
  }
};

export const getCategories = async (req, res) => {
  const pathParts = req.url.split("/");
  const menuType = pathParts[2];

  if (!menuType) {
    return sendBadRequest(res, { message: "Menu type slug is required" });
  }

  try {
    const menutypeCategories = await getCategoriesByMenuTypeSlug(menuType);

    if (!menutypeCategories) {
      return sendBadRequest(res, { message: "Menu type not found" });
    }

    return sendSuccess(res, { menutypeCategories });
  } catch (error) {
    console.error("Error categories:", error);
    return sendServerError(res, { message: "Internal Server Error" });
  }
};

export const getMeals = async (req, res) => {
  const pathParts = req.url.split("/");
  const categorySlug = pathParts[2];

  if (!categorySlug) {
    return sendBadRequest(res, { message: "Category slug is required" });
  }

  try {
    const meals = await getMealsByCategorySlug(categorySlug);

    if (!meals) {
      return sendBadRequest(res, { message: "Category not found" });
    }
    return sendSuccess(res, { meals });
  } catch (error) {
    console.error("Error fetching meals:", error);
    return sendServerError(res, { error: "Internal Server Error" });
  }
};
