import formidable from "formidable";
import { uploadImageToCloudinary } from "../../utility/handleFileUpload.js";
import { generateId } from "../../utility/generateMeals.js";
import { insertMeal } from "../../models/mealModel.js";
export const handleMealsUpload = async (req, res) => {
  const form = formidable({ keepExtensions: true });

  form.parse(req, async (error, fields, files) => {
    if (error) {
      res.writeHead(400, { "Content-Type": "application/json" });
      return res.end(JSON.stringify({ message: "file upload error" }));
    }

    // Extract fields safely
    const getField = (field) => (Array.isArray(field) ? field[0] : field);

    const mealName = getField(fields.mealName);
    const description = getField(fields.description);
    const price = getField(fields.price);
    const discount = getField(fields.discount);
    const isFeatured = getField(fields.isFeatured);
    const menuTypeId = getField(fields.menuTypeId);
    const categoryId = getField(fields.categoryId);
    const image = files.mealImage
      ? Array.isArray(files.mealImage)
        ? files.mealImage[0]
        : files.mealImage
      : null;

    // espond early
    res.writeHead(200, { "Content-Type": "application/json" });
    res.end(
      JSON.stringify({ message: "Meal received. Processing in background..." })
    );

    // ⏳ Continue in background
    try {
      const imageUrl = await uploadImageToCloudinary(image);
      const meal = {
        id: generateId(),
        mealName,
        price,
        mealImage: imageUrl,
        discount,
        description,
        isFeatured,
        categoryId,
        menuTypeId,
      };

      await insertMeal(meal);
      console.log("Meal uploaded successfully");
    } catch (error) {
      console.error("upload failed:", err);
      res.writeHead(500, { "Content-Type": "application/json" });
      res.end(JSON.stringify({ message: "internal server error" }));
    }
  });
};
