import { z } from "zod";
import mongoose, { Document, Schema } from "mongoose";

// User schema
const userSchema = new Schema({
  username: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  firstName: { type: String },
  lastName: { type: String },
  role: { type: String, required: true, default: "editor" },
  createdAt: { type: Date, default: Date.now }
}, { timestamps: { createdAt: 'createdAt', updatedAt: 'updatedAt' } });

export interface UserDocument extends Document {
  _doc?:User;
  username: string;
  password: string;
  email: string;
  firstName?: string;
  lastName?: string;
  role: string;
  createdAt: Date;
  updatedAt?: Date;
}

export const UserModel = mongoose.model<UserDocument>('User', userSchema);

export const insertUserSchema = z.object({
  username: z.string(),
  password: z.string(),
  email: z.string().email(),
  firstName: z.string().optional(),
  lastName: z.string().optional(),
  role: z.string().default("editor")
});

export type InsertUser = z.infer<typeof insertUserSchema>;
export type User = UserDocument;

// Category schema
const categorySchema = new Schema({
  name: { type: String, required: true },
  slug: { type: String, required: true, unique: true },
  description: { type: String },
  createdAt: { type: Date, default: Date.now }
}, { timestamps: { createdAt: 'createdAt', updatedAt: 'updatedAt' } });

export interface CategoryDocument extends Document {
  name: string;
  slug: string;
  description?: string;
  createdAt: Date;
  updatedAt?: Date;
}

export const CategoryModel = mongoose.model<CategoryDocument>('Category', categorySchema);

export const insertCategorySchema = z.object({
  name: z.string(),
  slug: z.string(),
  description: z.string().optional()
});

export type InsertCategory = z.infer<typeof insertCategorySchema>;
export type Category = CategoryDocument;

// Post schema
const postSchema = new Schema({
  title: { type: String, required: true },
  slug: { type: String, required: true, unique: true },
  content: { type: String },
  excerpt: { type: String },
  category: { type: Schema.Types.ObjectId, ref: 'Category' },
  author: { type: Schema.Types.ObjectId, ref: 'User', required: true },
  featuredImage: { type: String },
  status: { type: String, default: 'draft', required: true },
  metaTitle: { type: String },
  metaDescription: { type: String },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now }
}, { timestamps: { createdAt: 'createdAt', updatedAt: 'updatedAt' } });

export interface PostDocument extends Document {
  title: string;
  slug: string;
  content?: string;
  excerpt?: string;
  category?: CategoryDocument['_id'];
  author: UserDocument['_id'];
  featuredImage?: string;
  status: string;
  metaTitle?: string;
  metaDescription?: string;
  createdAt: Date;
  updatedAt: Date;
}

export const PostModel = mongoose.model<PostDocument>('Post', postSchema);

export const insertPostSchema = z.object({
  title: z.string(),
  slug: z.string(),
  content: z.string().optional(),
  excerpt: z.string().optional(),
  category: z.string().optional(), // MongoDB ObjectId as string
  author: z.string(), // MongoDB ObjectId as string
  featuredImage: z.string().optional(),
  status: z.string().default("draft"),
  metaTitle: z.string().optional(),
  metaDescription: z.string().optional()
});

export type InsertPost = z.infer<typeof insertPostSchema>;
export type Post = PostDocument;

// Page schema
const pageSchema = new Schema({
  title: { type: String, required: true },
  slug: { type: String, required: true, unique: true },
  content: { type: String },
  author: { type: Schema.Types.ObjectId, ref: 'User', required: true },
  status: { type: String, default: 'draft', required: true },
  metaTitle: { type: String },
  metaDescription: { type: String },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now }
}, { timestamps: { createdAt: 'createdAt', updatedAt: 'updatedAt' } });

export interface PageDocument extends Document {
  title: string;
  slug: string;
  content?: string;
  author: UserDocument['_id'];
  status: string;
  metaTitle?: string;
  metaDescription?: string;
  createdAt: Date;
  updatedAt: Date;
}

export const PageModel = mongoose.model<PageDocument>('Page', pageSchema);

export const insertPageSchema = z.object({
  title: z.string(),
  slug: z.string(),
  content: z.string().optional(),
  author: z.string(), // MongoDB ObjectId as string
  status: z.string().default("draft"),
  metaTitle: z.string().optional(),
  metaDescription: z.string().optional()
});

export type InsertPage = z.infer<typeof insertPageSchema>;
export type Page = PageDocument;

// Media schema
const mediaSchema = new Schema({
  filename: { type: String, required: true, unique: true },
  originalFilename: { type: String, required: true },
  filePath: { type: String, required: true },
  fileType: { type: String, required: true },
  fileSize: { type: Number, required: true },
  width: { type: Number },
  height: { type: Number },
  uploadedBy: { type: Schema.Types.ObjectId, ref: 'User', required: true },
  createdAt: { type: Date, default: Date.now }
}, { timestamps: { createdAt: 'createdAt', updatedAt: 'updatedAt' } });

export interface MediaDocument extends Document {
  filename: string;
  originalFilename: string;
  filePath: string;
  fileType: string;
  fileSize: number;
  width?: number;
  height?: number;
  uploadedBy: UserDocument['_id'];
  createdAt: Date;
  updatedAt?: Date;
}

export const MediaModel = mongoose.model<MediaDocument>('Media', mediaSchema);

export const insertMediaSchema = z.object({
  filename: z.string(),
  originalFilename: z.string(),
  filePath: z.string(),
  fileType: z.string(),
  fileSize: z.number(),
  width: z.number().optional(),
  height: z.number().optional(),
  uploadedBy: z.string() // MongoDB ObjectId as string
});

export type InsertMedia = z.infer<typeof insertMediaSchema>;
export type Media = MediaDocument;

// Settings schema
const settingSchema = new Schema({
  settingKey: { type: String, required: true, unique: true },
  settingValue: { type: String },
  settingType: { type: String, default: 'string', required: true },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now }
}, { timestamps: { createdAt: 'createdAt', updatedAt: 'updatedAt' } });

export interface SettingDocument extends Document {
  settingKey: string;
  settingValue?: string;
  settingType: string;
  createdAt: Date;
  updatedAt: Date;
}

export const SettingModel = mongoose.model<SettingDocument>('Setting', settingSchema);

export const insertSettingSchema = z.object({
  settingKey: z.string(),
  settingValue: z.string().optional(),
  settingType: z.string().default('string')
});

export type InsertSetting = z.infer<typeof insertSettingSchema>;
export type Setting = SettingDocument;

// Define a more detailed schema for homepage sections
export const homepageSectionItemSchema = z.object({
  title: z.string(),
  content: z.string().optional(),
  icon: z.string().optional()
});

export const homepageSectionSchema = z.object({
  type: z.string(),
  title: z.string(),
  subtitle: z.string().optional(),
  content: z.string().optional(),
  items: z.array(homepageSectionItemSchema).optional()
});

export const homepageValidationSchema = z.object({
  sections: z.array(homepageSectionSchema)
});

// Homepage schema
const homepageMongoSchema = new Schema({
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
  updatedAt: { type: Date, default: Date.now }
}, { timestamps: { createdAt: 'createdAt', updatedAt: 'updatedAt' } });

export interface HomepageDocument extends Document {
  sections: any; // JSON object containing sections
  version?: string;
  downloadUrl?: string;
  downloadId?: string;
  metaTitle?: string;
  metaDescription?: string;
  metaKeywords?: string;
  ogTitle?: string;
  ogDescription?: string;
  ogImage?: string;
  updatedAt: Date;
}

export const HomepageModel = mongoose.model<HomepageDocument>('Homepage', homepageMongoSchema);

export const insertHomepageSchema = z.object({
  sections: z.any(),
  version: z.string().optional(),
  downloadUrl: z.string().optional(),
  downloadId: z.string().optional(),
  metaTitle: z.string().optional(),
  metaDescription: z.string().optional(),
  metaKeywords: z.string().optional(),
  ogTitle: z.string().optional(),
  ogDescription: z.string().optional(),
  ogImage: z.string().optional()
});

export type HomepageSectionItem = z.infer<typeof homepageSectionItemSchema>;
export type HomepageSection = z.infer<typeof homepageSectionSchema>;
export type InsertHomepage = z.infer<typeof insertHomepageSchema>;
export type Homepage = HomepageDocument;



// Define a schema for app sections similar to homepage
export const appSectionItemSchema = z.object({
  title: z.string(),
  content: z.string().optional(),
  icon: z.string().optional(),
  image: z.string().optional()
});

export const appSectionSchema = z.object({
  type: z.string(),
  title: z.string(),
  subtitle: z.string().optional(),
  content: z.string().optional(),
  items: z.array(appSectionItemSchema).optional()
});

export const appValidationSchema = z.object({
  sections: z.array(appSectionSchema)
});

// App schema
const appMongoSchema = new Schema({
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
  author: { type: Schema.Types.ObjectId, ref: 'User' },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now }
}, { timestamps: { createdAt: 'createdAt', updatedAt: 'updatedAt' } });

export interface AppDocument extends Document {
  name: string;
  slug: string;
  description?: string;
  icon?: string;
  featuredImage?: string;
  sections?: any; // JSON object containing sections
  version?: string;
  downloadUrl?: string;
  downloadId?: string;
  metaTitle?: string;
  metaDescription?: string;
  metaKeywords?: string;
  ogTitle?: string;
  ogDescription?: string;
  ogImage?: string;
  content?: string;
  githubUrl?: string;
  websiteUrl?: string;
  isActive: boolean;
  author?: UserDocument['_id'];
  createdAt: Date;
  updatedAt: Date;
}

export const AppModel = mongoose.model<AppDocument>('App', appMongoSchema);

export const insertAppSchema = z.object({
  name: z.string(),
  slug: z.string(),
  description: z.string().optional(),
  icon: z.string().optional(),
  featuredImage: z.string().optional(),
  sections: z.any().optional(),
  version: z.string().optional(),
  downloadUrl: z.string().optional(),
  downloadId: z.string().optional(),
  metaTitle: z.string().optional(),
  metaDescription: z.string().optional(),
  metaKeywords: z.string().optional(),
  ogTitle: z.string().optional(),
  ogDescription: z.string().optional(),
  ogImage: z.string().optional(),
  content: z.string().optional(),
  githubUrl: z.string().optional(),
  websiteUrl: z.string().optional(),
  isActive: z.boolean().default(true),
  author: z.string().optional() // MongoDB ObjectId as string
});

export type AppSectionItem = z.infer<typeof appSectionItemSchema>;
export type AppSection = z.infer<typeof appSectionSchema>;
export type InsertApp = z.infer<typeof insertAppSchema>;
export type App = AppDocument;

// MongoDB handles relationships through references
// No need for Drizzle-specific relation definitions

// URL Redirects schema
const redirectSchema = new Schema({
  sourceUrl: { type: String, required: true, unique: true },
  targetUrl: { type: String, required: true },
  statusCode: { type: Number, default: 301, required: true },
  isPermanent: { type: Boolean, default: true, required: true },
  isActive: { type: Boolean, default: true, required: true },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now }
}, { timestamps: { createdAt: 'createdAt', updatedAt: 'updatedAt' } });

export interface RedirectDocument extends Document {
  sourceUrl: string;
  targetUrl: string;
  statusCode: number;
  isPermanent: boolean;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export const RedirectModel = mongoose.model<RedirectDocument>('Redirect', redirectSchema);

export const insertRedirectSchema = z.object({
  sourceUrl: z.string(),
  targetUrl: z.string(),
  statusCode: z.number().default(301),
  isPermanent: z.boolean().default(true),
  isActive: z.boolean().default(true)
});

export type InsertRedirect = z.infer<typeof insertRedirectSchema>;
export type Redirect = RedirectDocument;

// Sitemap entries schema
const sitemapEntrySchema = new Schema({
  url: { type: String, required: true, unique: true },
  changeFrequency: { type: String, default: 'weekly', required: true },
  priority: { type: String, default: '0.5', required: true },
  lastModified: { type: Date, default: Date.now },
  isActive: { type: Boolean, default: true, required: true },
  type: { type: String, default: 'page', required: true }, // page, post, app, etc.
  relatedId: { type: mongoose.Schema.Types.ObjectId } // ID of the related content
}, { timestamps: { createdAt: 'createdAt', updatedAt: 'updatedAt' } });

export interface SitemapEntryDocument extends Document {
  url: string;
  changeFrequency: string;
  priority: string;
  lastModified: Date;
  isActive: boolean;
  type: string;
  relatedId?: mongoose.Types.ObjectId;
  createdAt: Date;
  updatedAt?: Date;
}

export const SitemapEntryModel = mongoose.model<SitemapEntryDocument>('SitemapEntry', sitemapEntrySchema);

export const insertSitemapEntrySchema = z.object({
  url: z.string(),
  changeFrequency: z.string().default('weekly'),
  priority: z.string().default('0.5'),
  isActive: z.boolean().default(true),
  type: z.string().default('page'),
  relatedId: z.string().optional() // MongoDB ObjectId as string
});

export type InsertSitemapEntry = z.infer<typeof insertSitemapEntrySchema>;
export type SitemapEntry = SitemapEntryDocument;

// Schema.org structured data schema
const structuredDataSchema = new Schema({
  entityType: { type: String, required: true }, // Article, Product, WebPage, etc.
  entityId: { type: mongoose.Schema.Types.ObjectId, required: true }, // ID of the related content
  schemaType: { type: String, required: true }, // Article, SoftwareApplication, etc.
  schemaData: { type: Object, required: true },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now }
}, { timestamps: { createdAt: 'createdAt', updatedAt: 'updatedAt' } });

export interface StructuredDataDocument extends Document {
  entityType: string;
  entityId: mongoose.Types.ObjectId;
  schemaType: string;
  schemaData: any; // JSON object
  createdAt: Date;
  updatedAt: Date;
}

export const StructuredDataModel = mongoose.model<StructuredDataDocument>('StructuredData', structuredDataSchema);

export const insertStructuredDataSchema = z.object({
  entityType: z.string(),
  entityId: z.string(), // MongoDB ObjectId as string
  schemaType: z.string(),
  schemaData: z.any() // JSON object
});

export type InsertStructuredData = z.infer<typeof insertStructuredDataSchema>;
export type StructuredData = StructuredDataDocument;
