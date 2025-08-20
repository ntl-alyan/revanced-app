const mongoose = require("mongoose");

// User schema
const userSchema = new mongoose.Schema({
  username: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  firstName: { type: String },
  lastName: { type: String },
  role: { type: String, required: true, default: "editor" },
  createdAt: { type: Date, default: Date.now }
}, { timestamps: { createdAt: 'createdAt', updatedAt: 'updatedAt' } });

exports.UserModel = mongoose.model('User', userSchema);

// Category schema
const categorySchema = new mongoose.Schema({
  name: { type: String, required: true },
  slug: { type: String, required: true, unique: true },
  description: { type: String },
  createdAt: { type: Date, default: Date.now }
}, { timestamps: { createdAt: 'createdAt', updatedAt: 'updatedAt' } });

exports.CategoryModel = mongoose.model('Category', categorySchema);

// Post schema
const postSchema = new mongoose.Schema({
  title: { type: String, required: true },
  slug: { type: String, required: true, unique: true },
  content: { type: String },
  excerpt: { type: String },
  category: { type: mongoose.Schema.Types.ObjectId, ref: 'Category' },
  author: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  featuredImage: { type: String },
  status: { type: String, default: 'draft', required: true },
  metaTitle: { type: String },
  metaDescription: { type: String },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now }
}, { timestamps: { createdAt: 'createdAt', updatedAt: 'updatedAt' } });

exports.PostModel = mongoose.model('Post', postSchema);

// Page schema
const pageSchema = new mongoose.Schema({
  title: { type: String, required: true },
  slug: { type: String, required: true, unique: true },
  content: { type: String },
  author: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  status: { type: String, default: 'draft', required: true },
  metaTitle: { type: String },
  metaDescription: { type: String },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now }
}, { timestamps: { createdAt: 'createdAt', updatedAt: 'updatedAt' } });

exports.PageModel = mongoose.model('Page', pageSchema);

// Media schema
const mediaSchema = new mongoose.Schema({
  filename: { type: String, required: true, unique: true },
  originalFilename: { type: String, required: true },
  filePath: { type: String, required: true },
  fileType: { type: String, required: true },
  fileSize: { type: Number, required: true },
  width: { type: Number },
  height: { type: Number },
  uploadedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  createdAt: { type: Date, default: Date.now }
}, { timestamps: { createdAt: 'createdAt', updatedAt: 'updatedAt' } });

exports.MediaModel = mongoose.model('Media', mediaSchema);

// Settings schema
const settingSchema = new mongoose.Schema({
  settingKey: { type: String, required: true, unique: true },
  settingValue: { type: String },
  settingType: { type: String, default: 'string', required: true },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now }
}, { timestamps: { createdAt: 'createdAt', updatedAt: 'updatedAt' } });

exports.SettingModel = mongoose.model('Setting', settingSchema);

// Homepage schema
const homepageMongoSchema = new mongoose.Schema({
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

exports.HomepageModel = mongoose.model('Homepage', homepageMongoSchema);

// App schema
const appMongoSchema = new mongoose.Schema({
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
  author: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now }
}, { timestamps: { createdAt: 'createdAt', updatedAt: 'updatedAt' } });

exports.AppModel = mongoose.model('App', appMongoSchema);

// URL Redirects schema
const redirectSchema = new mongoose.Schema({
  sourceUrl: { type: String, required: true, unique: true },
  targetUrl: { type: String, required: true },
  statusCode: { type: Number, default: 301, required: true },
  isPermanent: { type: Boolean, default: true, required: true },
  isActive: { type: Boolean, default: true, required: true },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now }
}, { timestamps: { createdAt: 'createdAt', updatedAt: 'updatedAt' } });

exports.RedirectModel = mongoose.model('Redirect', redirectSchema);

// Sitemap entries schema
const sitemapEntrySchema = new mongoose.Schema({
  url: { type: String, required: true, unique: true },
  changeFrequency: { type: String, default: 'weekly', required: true },
  priority: { type: String, default: '0.5', required: true },
  lastModified: { type: Date, default: Date.now },
  isActive: { type: Boolean, default: true, required: true },
  type: { type: String, default: 'page', required: true },
  relatedId: { type: mongoose.Schema.Types.ObjectId }
}, { timestamps: { createdAt: 'createdAt', updatedAt: 'updatedAt' } });

exports.SitemapEntryModel = mongoose.model('SitemapEntry', sitemapEntrySchema);

// Schema.org structured data schema
const structuredDataSchema = new mongoose.Schema({
  entityType: { type: String, required: true },
  entityId: { type: mongoose.Schema.Types.ObjectId, required: true },
  schemaType: { type: String, required: true },
  schemaData: { type: Object, required: true },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now }
}, { timestamps: { createdAt: 'createdAt', updatedAt: 'updatedAt' } });

exports.StructuredDataModel = mongoose.model('StructuredData', structuredDataSchema);