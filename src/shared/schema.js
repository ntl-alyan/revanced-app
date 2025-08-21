import mongoose from "mongoose";

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
	 PAGE SCHEMA
-------------------------------- */
const pageSchema = new mongoose.Schema(
	{
		title: { type: String, required: true },
		slug: { type: String, required: true, unique: true },
		content: { type: String },
		author: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
		status: { type: String, default: "draft", required: true },
		metaTitle: { type: String },
		metaDescription: { type: String },
	},
	{ timestamps: true }
);

export const PageModel =
	mongoose.models.Page || mongoose.model("Page", pageSchema);

/* -------------------------------
	 MEDIA SCHEMA
-------------------------------- */
const mediaSchema = new mongoose.Schema(
	{
		filename: { type: String, required: true, unique: true },
		originalFilename: { type: String, required: true },
		filePath: { type: String, required: true },
		fileType: { type: String, required: true },
		fileSize: { type: Number, required: true },
		width: { type: Number },
		height: { type: Number },
		uploadedBy: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
	},
	{ timestamps: true }
);

export const MediaModel =
	mongoose.models.Media || mongoose.model("Media", mediaSchema);

/* -------------------------------
	 SETTINGS SCHEMA
-------------------------------- */
const settingSchema = new mongoose.Schema(
	{
		settingKey: { type: String, required: true, unique: true },
		settingValue: { type: String },
		settingType: { type: String, default: "string", required: true },
	},
	{ timestamps: true }
);

export const SettingModel =
	mongoose.models.Setting || mongoose.model("Setting", settingSchema);

/* -------------------------------
	 HOMEPAGE SCHEMA
-------------------------------- */
const homepageSchema = new mongoose.Schema(
	{
		sections: { type: Object, required: true },
		version: { type: String },
		downloadUrl: { type: String },
		downloadId: { type: String, unique: true, sparse: true },
		metaTitle: { type: String },
		metaDescription: { type: String },
		metaKeywords: { type: String },
		ogTitle: { type: String },
		ogDescription: { type: String },
		ogImage: { type: String },
	},
	{ timestamps: true }
);

export const HomepageModel =
	mongoose.models.Homepage || mongoose.model("Homepage", homepageSchema);

/* -------------------------------
	 APP SCHEMA
-------------------------------- */
const appSchema = new mongoose.Schema(
	{
		name: { type: String, required: true },
		slug: { type: String, required: true, unique: true },
		description: { type: String },
		icon: { type: String },
		featuredImage: { type: String },
		sections: { type: Object, default: [] },
		version: { type: String },
		downloadUrl: { type: String },
		downloadId: { type: String, unique: true, sparse: true },
		metaTitle: { type: String },
		metaDescription: { type: String },
		metaKeywords: { type: String },
		ogTitle: { type: String },
		ogDescription: { type: String },
		ogImage: { type: String },
		content: { type: String },
		githubUrl: { type: String },
		websiteUrl: { type: String },
		isActive: { type: Boolean, default: true, required: true },
		author: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
	},
	{ timestamps: true }
);

export const AppModel =
	mongoose.models.App || mongoose.model("App", appSchema);

/* -------------------------------
	 REDIRECT SCHEMA
-------------------------------- */
const redirectSchema = new mongoose.Schema(
	{
		sourceUrl: { type: String, required: true, unique: true },
		targetUrl: { type: String, required: true },
		statusCode: { type: Number, default: 301, required: true },
		isPermanent: { type: Boolean, default: true, required: true },
		isActive: { type: Boolean, default: true, required: true },
	},
	{ timestamps: true }
);

export const RedirectModel =
	mongoose.models.Redirect || mongoose.model("Redirect", redirectSchema);

/* -------------------------------
	 SITEMAP SCHEMA
-------------------------------- */
const sitemapSchema = new mongoose.Schema(
	{
		url: { type: String, required: true, unique: true },
		changeFrequency: { type: String, default: "weekly", required: true },
		priority: { type: String, default: "0.5", required: true },
		isActive: { type: Boolean, default: true, required: true },
		type: { type: String, default: "page", required: true },
		relatedId: { type: mongoose.Schema.Types.ObjectId },
	},
	{ timestamps: true }
);

export const SitemapEntryModel =
	mongoose.models.SitemapEntry || mongoose.model("SitemapEntry", sitemapSchema);

/* -------------------------------
	 STRUCTURED DATA SCHEMA
-------------------------------- */
const structuredDataSchema = new mongoose.Schema(
	{
		entityType: { type: String, required: true },
		entityId: { type: mongoose.Schema.Types.ObjectId, required: true },
		schemaType: { type: String, required: true },
		schemaData: { type: Object, required: true },
	},
	{ timestamps: true }
);

export const StructuredDataModel =
	mongoose.models.StructuredData ||
	mongoose.model("StructuredData", structuredDataSchema);
	
	
	
	const homepageSectionSchema = new mongoose.Schema({
  title: String,
  description: String,
  image: String,
});

const HomepageSection =
  mongoose.models.HomepageSection ||
  mongoose.model("HomepageSection", homepageSectionSchema);

export { homepageSectionSchema, HomepageSection };
