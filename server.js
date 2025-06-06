import http from "http";
import { handleCORS, handlePreflight } from "./config/handleCors.js";
import { createTTLIndex } from "./middleware/manageSessions.js";
import { sendMethodNotAllowed, sendNotFound } from "./utility/sendResponse.js";
import { routes } from "./routes.js";
import {
  getMeals,
  getCategories,
} from "./controllers/mealsControllers/menuRoutes.js";
import dotenv from "dotenv";
dotenv.config();

const port = process.env.PORT || 5000;
await createTTLIndex();

const server = http.createServer(async (req, res) => {
  if (handlePreflight(req, res)) return;

  handleCORS(req, res);

  const { method, url, headers } = req;
  const pathname = new URL(url, `http://${headers.host}`).pathname;

  // Add /health route here
  if (pathname === "/health" && method === "GET") {
    res.writeHead(200, { "Content-Type": "application/json" });
    res.end(
      JSON.stringify({
        status: "ok",
        time: new Date().toISOString(),
        dbStatus: "ok", // You can check DB status here if needed
      })
    );
    return;
  }

  // Special dynamic meals route
  if (pathname.startsWith("/meals") && method === "GET") {
    return await getMeals(req, res);
  } else if (pathname.startsWith("/categories")) {
    return await getCategories(req, res);
  }

  const methodRoutes = routes[method];

  if (!methodRoutes) {
    return sendMethodNotAllowed(res, {
      message: `Method ${method} not allowed`,
    });
  }

  const routeHandler = methodRoutes[pathname];

  if (routeHandler) {
    return await routeHandler(req, res);
  }

  const allowedMethods = Object.keys(routes).filter((m) => routes[m][pathname]);

  if (allowedMethods.length > 0) {
    return sendMethodNotAllowed(res, {
      message: `Method ${method} not allowed for ${pathname}`,
    });
  }

  // Otherwise, route not found
  return sendNotFound(res, { message: `Route ${pathname} not found` });
});

server.listen(port, () => console.log(`Server running on port ${port}`));
