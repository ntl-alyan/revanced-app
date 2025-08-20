// /pages/api/categories/[id].js
import init from "@/src/lib/db";
import { ObjectId } from "mongodb";

export default async function handler(req, res) {
  const { id } = req.query;

  try {
    const db = await init();

    if (req.method === "GET") {
      // Fetch single category by ID
      const category = await db.collection("categories").findOne({ _id: new ObjectId(id) });
      if (!category) {
        return res.status(404).json({ error: "Category not found" });
      }
      return res.status(200).json(category);
    }

    if (req.method === "PUT") {
      const body = req.body;
      const { name, slug, description } = body;

      if (!name || !slug) {
        return res.status(400).json({ error: "Name and slug are required" });
      }

      const updatedCategory = await db.collection("categories").findOneAndUpdate(
        { _id: new ObjectId(id) },
        { $set: { name, slug, description: description || "" } },
        { returnDocument: "after" }
      );

      return res.status(200).json(updatedCategory.value);
    }

    res.setHeader("Allow", ["GET", "PUT"]);
    res.status(405).end(`Method ${req.method} Not Allowed`);
  } catch (error) {
    console.error("API /categories/[id] error:", error);
    res.status(500).json({ error: "Internal server error" });
  }
}
