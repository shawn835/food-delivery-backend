import { readCollection } from "../config/readDb.js";

export const getMenuTypes = async (req, res) => {
  try {
    const menuTypesDb = await readCollection("menuTypes");
    const menuTypes = await menuTypesDb.find().toArray();
    const types = menuTypes.map((menuType) => ({
      id: menuType._id,
      name: menuType.name,
    }));

    res.writeHead(200, { "Content-Type": "application/json" });
    res.end(JSON.stringify(types));
  } catch (error) {
    console.error("Error fetching menu types:", error);
    res.writeHead(500, { "Content-Type": "application/json" });
    res.end(JSON.stringify({ error: "Internal Server Error" }));
  }
};

export const getCategories = async (req, res) => {
  const pathParts = req.url.split("/");
  const menuType = pathParts[2];

  if (!menuType) {
    res.writeHead(400, { "Content-Type": "application/json" });
    res.end(JSON.stringify({ error: "Menu type slug is required" }));
    return;
  }

  try {
    const menuTypesDb = await readCollection("menuTypes");
    const categoriesDb = await readCollection("categories");

    //locate the menutype
    const menuTypeDoc = await menuTypesDb.findOne({ name: menuType });

    if (!menuTypeDoc) {
      res.writeHead(404, { "Content-Type": "application/json" });
      res.end(JSON.stringify({ message: "Menu type not found" }));
      return;
    }

    //locate categories for the menutype
    const categories = await categoriesDb
      .find({ menuTypeId: menuTypeDoc._id })
      .toArray();

    const categorieTypes = categories.map((cat) => ({
      id: cat._id,
      name: cat.name,
      slug: cat.slug,
    }));
    res.writeHead(200, { "Content-Type": "application/json" });
    res.end(JSON.stringify(categorieTypes));
  } catch (error) {
    console.error("Error categories:", error);
    res.writeHead(500, { "Content-Type": "application/json" });
    res.end(JSON.stringify({ error: "Internal Server Error" }));
  }
};

export const getMeals = async (req, res) => {
  const pathParts = req.url.split("/");
  const categorySlug = pathParts[2];

  console.log(categorySlug);

  if (!categorySlug) {
    res.writeHead(400, { "Content-Type": "application/json" });
    res.end(JSON.stringify({ error: "Category slug is required" }));
    return;
  }

  try {
    const categoriesDb = await readCollection("categories");
    const mealsDb = await readCollection("meals");

    //locate the category
    const categoryDoc = await categoriesDb.findOne({ slug: categorySlug });

    if (!categoryDoc) {
      res.writeHead(404, { "Content-Type": "application/json" });
      res.end(JSON.stringify({ message: "Category not found" }));
      return;
    }

    //locate meals for the category
    const meals = await mealsDb.find({ categoryId: categoryDoc._id }).toArray();

    const mealTypes = meals.map((meal) => ({
      id: meal.id,
      name: meal.mealName,
      price: meal.price,
      imageUrl: meal.mealImage,
      rating: meal.rating,
      // averageRating: meal.averageRating,
      // totalRatings: meal.totalRatings,
    }));
    res.writeHead(200, { "Content-Type": "application/json" });
    res.end(JSON.stringify(mealTypes));
  } catch (error) {
    console.error("Error fetching meals:", error);
    res.writeHead(500, { "Content-Type": "application/json" });
    res.end(JSON.stringify({ error: "Internal Server Error" }));
  }
};
