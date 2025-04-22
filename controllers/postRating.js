import { readCollection } from "../config/readDb.js";
import { parseReqBody } from "../utility/parseReqBody";
import { getAuthenticateduserId } from "./authSession.js";
export const postRating = async (req, res) => {
  const userId = await getAuthenticateduserId(req);

  try {
    const { mealId, rating } = parseReqBody(req.body);
    if (!mealId || !rating || rating < 1 || rating > 5) {
      res.writeHead(400, { "Content-Type": "application/json" });
      res.end(JSON.stringify({ message: "Invalid input" }));
      return;
    }

    const ratingsDb = await readCollection("ratings");
    const mealsDb = await readCollection("menuData");

    //if userId already rated this meal
    const existingRating = await ratingsDb.findOne({ mealId, userId });
    if (existingRating) {
      //update rating
      await ratingsDb.updateOne(
        { mealId, userId },
        { $set: { rating, createdAt: new Date() } }
      );
    } else {
      //create new rating
      await ratingsDb.insertOne({
        mealId,
        userId,
        rating,
        createdAt: new Date(),
      });
    }

    //recalculateaverage and total
    const agg = await ratingsDb
      .aggregate([
        { $match: { mealId } },
        {
          $group: {
            _id: "$mealId",
            totalRatings: { $sum: 1 },
            averageRating: { $avg: "$rating" },
          },
        },
      ])
      .toArray();

    const { totalRatings, averageRating } = agg[0];

    //update meal collection
    await mealsDb.updateOne(
      { id: mealId },
      { $set: { totalRatings, averageRating } }
    );
    res.writeHead(200, { "Content-Type": "application/json" });
    res.end(
      JSON.stringify({
        message: "Rating submitted successfully",
        averageRating,
        totalRatings,
      })
    );
  } catch (error) {
    console.error("Error submitting rating:", error);
    res.writeHead(500, { "Content-Type": "application/json" });
    res.end(JSON.stringify({ message: "Internal server error" }));
  }
};
