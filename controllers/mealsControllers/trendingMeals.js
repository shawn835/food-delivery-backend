import { getTrendingMeals as fetchTrendingMeals } from "../../models/mealModel.js";

export const getTrendingMeals = async (req, res) => {
  try {
    const mealTypes = await fetchTrendingMeals();

    res.writeHead(200, { "Content-Type": "application/json" });
    res.end(JSON.stringify({ mealTypes }));
  } catch (error) {
    console.error("Error fetching trending meals:", error);
    res.writeHead(500, { "Content-Type": "application/json" });
    res.end(JSON.stringify({ message: "Internal Server Error" }));
  }
};
