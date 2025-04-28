import { readCollection } from "../config/readDb.js";
const collectionName = "meals";
export async function getAllMenuTypes() {
  const menuTypesDb = await readCollection("menuTypes");
  const menuTypes = await menuTypesDb.find().toArray();

  return menuTypes.map((menuType) => ({
    id: menuType._id,
    name: menuType.name,
  }));
}

export async function getCategoriesByMenuTypeSlug(menuTypeSlug) {
  const menuTypesDb = await readCollection("menuTypes");
  const categoriesDb = await readCollection("categories");

  // find the menuType document
  const menuTypeDoc = await menuTypesDb.findOne({ name: menuTypeSlug });

  if (!menuTypeDoc) return null;

  // find categories linked to this menuType
  const categories = await categoriesDb
    .find({ menuTypeId: menuTypeDoc._id })
    .toArray();

  return categories.map((cat) => ({
    id: cat._id,
    name: cat.name,
    slug: cat.slug,
  }));
}

export async function getMealsByCategorySlug(categorySlug) {
  const categoriesDb = await readCollection("categories");
  const mealsDb = await readCollection("meals");

  // Get category by slug
  const categoryDoc = await categoriesDb.findOne({ slug: categorySlug });
  if (!categoryDoc) return null;

  // Fetch meals tied to this category
  const meals = await mealsDb.find({ categoryId: categoryDoc._id }).toArray();

  return meals.map((meal) => ({
    id: meal.id,
    name: meal.mealName,
    price: meal.price,
    imageUrl: meal.mealImage,
    rating: meal.rating,
    // Uncomment if you're planning to expose these:
    // averageRating: meal.averageRating,
    // totalRatings: meal.totalRatings,
  }));
}

export async function getTrendingMeals() {
  const mealsCollection = await readCollection(collectionName);

  // Random meals with rating > 4
  const randomMealsWithHighRatings = await mealsCollection
    .aggregate([{ $match: { rating: { $gt: 4 } } }, { $sample: { size: 5 } }])
    .toArray();

  // Top ordered meals based on number of orders
  const topOrderedMeals = await mealsCollection
    .aggregate([
      {
        $lookup: {
          from: "orders",
          localField: "id",
          foreignField: "items.itemId",
          as: "orderCount",
        },
      },
      { $addFields: { totalOrders: { $size: "$orderCount" } } },
      { $sort: { totalOrders: -1 } },
      { $limit: 5 },
    ])
    .toArray();

  // Combine and deduplicate by `id`
  const combinedMeals = [...randomMealsWithHighRatings, ...topOrderedMeals];
  const uniqueMeals = Array.from(
    new Map(combinedMeals.map((meal) => [meal.id, meal])).values()
  );

  // Return only required fields
  return uniqueMeals.map((meal) => ({
    id: meal.id,
    name: meal.mealName,
    price: meal.price,
    imageUrl: meal.mealImage,
    rating: meal.rating,
    // averageRating: meal.averageRating,
    // totalRatings: meal.totalRatings,
  }));
}

export const findMealById = async (mealId) => {
  try {
    const mealsCollection = await readCollection(collectionName);
    const meal = await mealsCollection.findOne({ id: mealId });
    return meal;
  } catch (err) {
    console.error("Error finding order by ID:", err);
    throw err;
  }
};

export const insertMeal = async (meal) => {
  try {
    const mealsCollection = await readCollection("testingDb");
    await mealsCollection.insertOne(meal);
  } catch (error) {
    console.error("error creating user:", err);
    throw err;
  }
};

export const addMealTofavourites = async (userId, mealId) => {
  try {
    const favouritesCollection = await readCollection("favourites");
    await favouritesCollection.insertOne({
      userId,
      mealId,
      createdAt: new Date(),
    });
  } catch (error) {
    throw error;
  }
};

export const findFavouriteMeal = async (userId, mealId) => {
  try {
    const favouritesCollection = await readCollection("favourites");
    const meal = await favouritesCollection.findOne({ userId, mealId });
    return meal;
  } catch (err) {
    console.error("Error finding order by ID:", err);
    throw err;
  }
};

export const removeMealFromFavourites = async (userId, mealId) => {
  try {
    const favouritesCollection = await readCollection("favourites");
    await favouritesCollection.deleteOne({ userId, mealId });
  } catch (err) {
    console.error("Error finding order by ID:", err);
    throw err;
  }
};
