import { readCollection } from "../config/readDb.js";
import slugify from "slugify";

export async function handleMenuRoute(req, res) {
  const pathParts = req.url.split("/");

  if (
    req.method === "GET" &&
    pathParts[1] === "api" &&
    pathParts[2] === "menu"
  ) {
    const menuType = pathParts[3];
    try {
      const menuCollection = await readCollection("menuData");

      if (pathParts.length === 4) {
        const menu = await menuCollection.findOne({ menuType });

        if (!menu) {
          res.writeHead(404, { "Content-Type": "application/json" });
          res.end(JSON.stringify({ error: "Menu not found" }));
          return;
        }

        const categoriesWithSlugs = menu.categories.map((category) => ({
          ...category,
          slug: slugify(category.name, { lower: true }),
        }));

        const menuWithSlugs = {
          ...menu,
          categories: categoriesWithSlugs,
        };

        res.writeHead(200, { "Content-Type": "application/json" });
        res.end(JSON.stringify(menuWithSlugs));
        return;
      }

      if (pathParts.length === 5 && pathParts[4] === "categories") {
        const menu = await menuCollection.findOne({ menuType });
        if (!menu || !menu.categories) {
          res.writeHead(404, { "Content-Type": "application/json" });
          res.end(JSON.stringify({ error: "Categories not found" }));
          return;
        }

        const categories = menu.categories.map((cat) => ({
          name: cat.name,
          slug: slugify(cat.name, { lower: true }),
        }));

        res.writeHead(200, { "Content-Type": "application/json" });
        res.end(JSON.stringify({ categories }));
        return;
      }

      res.writeHead(404, { "Content-Type": "application/json" });
      res.end(JSON.stringify({ error: "Not found" }));
    } catch (error) {
      res.writeHead(500, { "Content-Type": "application/json" });
      res.end(JSON.stringify({ error: "Internal server error" }));
    }
  }

  return false;
}
