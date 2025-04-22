import http from "http";
import { registerUser } from "./controllers/register.js";
import { loginUser } from "./controllers/login.js";
import { updateUserAccount } from "./controllers/updateUser.js";
import { logoutUser } from "./controllers/logout.js";
import { deleteUserAccount } from "./controllers/deleteUser.js";
import { createOrder } from "./controllers/orderController.js";
import { handleGetMe } from "./controllers/checkUser.js";
import { handleCORS, handlePreflight } from "./config/handleCors.js";
import { createTTLIndex } from "./controllers/manageSessions.js";
import { getMenuTypes, getCategories, getMeals } from "./menu/menuRoutes.js";
import { stkPushRequest } from "./payment/stkPush.js";
import { confirmationHandler } from "./payment/confirmationHandler.js";
const port = process.env.PORT || 5000;

await createTTLIndex();
const server = http.createServer(async (req, res) => {
  handleCORS(req, res);

  if (handlePreflight(req, res)) {
    return;
  }

  if (req.method === "POST") {
    if (req.url === "/register") {
      await registerUser(req, res);
    } else if (req.url === "/login") {
      await loginUser(req, res);
    } else if (req.url === "/logout") {
      await logoutUser(req, res);
    } else if (req.url === "/order") {
      await createOrder(req, res);
    } else if (req.url === "/stkPush") {
      await stkPushRequest(req, res);
    } else if (req.url === "/api/v1/mpesa/confirmation") {
      await confirmationHandler(req, res);
    }
  } else if (req.method == "GET") {
    if (req.url === "/me") {
      handleGetMe(req, res);
    } else if (req.url === "/menutypes") {
      await getMenuTypes(req, res);
    } else if (req.url.startsWith("/categories")) {
      await getCategories(req, res);
    } else if (req.url.startsWith("/meals")) {
      await getMeals(req, res);
    }
  } else if (req.method === "PUT") {
    if (req.url === "/updateUser") {
      await updateUserAccount(req, res);
    }
  } else if ((req.method = "DELETE")) {
    if (req.url === "/deleteUser") {
      await deleteUserAccount(req, res);
    }
  }
});

server.listen(port, () => console.log(`server running on port ${port}`));
