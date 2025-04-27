import { readCollection } from "../../config/readDb.js";
import slugify from "slugify";

export async function migrateMenuData() {
  try {
    const oldDb = await readCollection("menuData");
    const menuTypesDb = await readCollection("menuTypes");
    const categoriesDb = await readCollection("categories");
    const mealsDb = await readCollection("meals");

    const allDocs = await oldDb.find().toArray();

    for (const doc of allDocs) {
      const { menuType, categories } = doc;

      // Insert into menuTypes collection
      const menuTypeInsert = await menuTypesDb.insertOne({ name: menuType });
      const menuTypeId = menuTypeInsert.insertedId;

      for (const category of categories) {
        const { name, meals } = category;

        // Insert into categories collection
        const categoryInsert = await categoriesDb.insertOne({
          name,
          slug: slugify(name, { lower: true }),
          menuTypeId,
        });
        const categoryId = categoryInsert.insertedId;

        // Insert meals into meals collection
        const mealsToInsert = meals.map((meal) => ({
          ...meal,
          categoryId,
          menuTypeId,
        }));

        if (mealsToInsert.length > 0) {
          await mealsDb.insertMany(mealsToInsert);
        }
      }
    }

    console.log("Migration complete");
  } catch (err) {
    console.error("Migration error:", err);
  }
}
