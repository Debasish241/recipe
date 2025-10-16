import express from "express";
import "dotenv/config";
import { ENV } from "./config/env.js";
import { db } from "./config/db.js";
import { favouritesTable } from "./db/schema.js";
import { and, eq } from "drizzle-orm";
import job from "./config/cron.js";
import morgan from "morgan"
import cors from "cors"
const app = express();
const PORT = ENV.PORT || 8000;

if(ENV.NODE_ENV==="production") job.start()

app.use(express.json());
app.use(morgan("dev"))
app.use(cors());

app.get("/api/health", (req, res) => {
  res.status(200).json({ success: true });
});

app.post("/api/favourites", async (req, res) => {
  try {
    const { userId, recipeId, title, image, cookTime, servings } = req.body;
    if (!userId || !recipeId || !title) {
      return res.status(400).json({ error: "Missing required fields" });
    }
    const newFavourite = await db
      .insert(favouritesTable)
      .values({
        userId,
        recipeId,
        title,
        image,
        cookTime,
        servings,
      })
      .returning();

    res.status(201).json(newFavourite[0]);
  } catch (error) {
    console.log("Error adding favourite");
    res.status(500).json({ error: "Something went wrong" });
  }
});

app.delete("/api/favourites/:userId/:recipeId", async (req, res) => {
  try {
    const { userId, recipeId } = req.params;
    await db
      .delete(favouritesTable)
      .where(
        and(
          eq(favouritesTable.userId, userId),
          eq(favouritesTable.recipeId, parseInt(recipeId))
        )
      );

    res.status(200).json({ message: "Favourite removed successfully " });
  } catch (error) {
    console.log("Error removing a favourite");
    res.status(500).json({ error: "Something went wrong" });
  }
});

app.get("/api/favourites/:userId", async (req, res) => {
  try {
    const { userId } = req.params;
    const userFavourites = await db
      .select()
      .from(favouritesTable)
      .where(eq(favouritesTable.userId, userId));

      res.status(200).json(userFavourites)
  } catch (error) {
    console.log("Error fetching a favourite");
    res.status(500).json({ error: "Something went wrong" });
  }
});
app.get("/",(req,res)=>{
  res.json({message:"server is running"})
})

app.listen(PORT, () => {
  console.log(`server is running on PORT :${PORT}`);
});
