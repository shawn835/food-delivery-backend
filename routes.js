import { registerUser } from "./controllers/userControllers/register.js";
import { loginUser } from "./controllers/userControllers/login.js";
import { updateUserAccount } from "./controllers/userControllers/updateUser.js";
import { logoutUser } from "./controllers/userControllers/logout.js";
import { deleteUserAccount } from "./controllers/userControllers/deleteUser.js";
import { createOrder } from "./controllers/orderController/orderController.js";
import { handleGetMe } from "./controllers/userControllers/checkUser.js";
import { getMenuTypes } from "./controllers/mealsControllers/menuRoutes.js";
import { stkPushRequest } from "./payment/stkPush.js";
import { confirmationHandler } from "./controllers/mpesaController/confirmationHandler.js";
import { getTrendingMeals } from "./controllers/mealsControllers/trendingMeals.js";
import { handleOrderHistory } from "./controllers/mealsControllers/orderHistory.js";
import { updateUserPassword } from "./controllers/userControllers/updateUserPassword.js";
import { handleMealsUpload } from "./controllers/mealsControllers/mealUpload.js";
import { getOrders } from "./controllers/mealsControllers/getOrders.js";

// Route Handlers
export const routes = {
  POST: {
    "/register": registerUser,
    "/login": loginUser,
    "/logout": logoutUser,
    "/order": createOrder,
    "/stkPush": stkPushRequest,
    "/api/v1/mpesa/confirmation": confirmationHandler,
    "/updatepassword": updateUserPassword,
    "/uploadmeals": handleMealsUpload,
    "/getallorders": getOrders,
  },
  GET: {
    "/me": handleGetMe,
    "/menutypes": getMenuTypes,
    "/trendymeals": getTrendingMeals,
    "/orderhistory": handleOrderHistory,
  },
  PUT: {
    "/updateUser": updateUserAccount,
  },
  DELETE: {
    "/deleteUser": deleteUserAccount,
  },
};
