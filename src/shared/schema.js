import mongoose from "mongoose";
import { z } from "zod";

/* -------------------------------
   MONGOOSE CONNECTION
-------------------------------- */
if (!mongoose.connection.readyState) {
  mongoose.connect(process.env.MONGO_URI, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  });
}

/* -------------------------------
   USER SCHEMA
-------------------------------- */
const userSchema = new mongoose.Schema(
  {
    username: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    firstName: { type: String },
    lastName: { type: String },
    role: { type: String, enum: ["admin", "editor"], default: "editor" },
  },
  { timestamps: true }
);

export const UserModel =
  mongoose.models.User || mongoose.model("User", userSchema);

/* -------------------------------
   CATEGORY SCHEMA
-------------------------------- */
const categorySchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    slug: { type: String, required: true, unique: true },
    description: { type: String },
  },
  { timestamps: true }
);

export const CategoryModel =
  mongoose.models.Category || mongoose.model("Category", categorySchema);

/* -------------------------------
   POST SCHEMA
-------------------------------- */
const postSchema = new mongoose.Schema(
  {
    title: { type: String, required: true },
    slug: { type: String, required: true, unique: true },
    content: { type: String },
    excerpt: { type: String },
    category: { type: mongoose.Schema.Types.ObjectId, ref: "Category" },
    author: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    featuredImage: { type: String },
    status: { type: String, default: "draft", required: true },
    metaTitle: { type: String },
    metaDescription: { type: String },
  },
  { timestamps: true }
);

export const PostModel =
  mongoose.models.Post || mongoose.model("Post", postSchema);

/* -------------------------------
   ZOD SCHEMAS (Validation)
-------------------------------- */
export const insertCategorySchema = z.object({
  name: z.string(),
  slug: z.string(),
  description: z.string().optional(),
});

export const extendedCategorySchema = insertCategorySchema.extend({
  name: z.string().min(2, "Name must be at least 2 characters"),
  slug: z.string().min(2, "Slug must be at least 2 characters"),
});
