import {
  mysqlTable,
  int,
  varchar,
  text,
  boolean,
  datetime,
  decimal,
  json,
} from "drizzle-orm/mysql-core";

// ============ BRANDS ============
export const brands = mysqlTable("brands", {
  id: int("id").autoincrement().primaryKey(),
  name: varchar("name", { length: 100 }).notNull(),
  slug: varchar("slug", { length: 100 }).notNull().unique(),
  logoUrl: text("logo_url"),
  isActive: boolean("is_active").default(true),
  sortOrder: int("sort_order").default(0),
  createdAt: datetime("created_at").$defaultFn(() => new Date()),
});

// ============ CATEGORIES ============
export const categories = mysqlTable("categories", {
  id: int("id").autoincrement().primaryKey(),
  name: varchar("name", { length: 200 }).notNull(),
  slug: varchar("slug", { length: 200 }).notNull().unique(),
  description: text("description"),
  imageUrl: text("image_url"),
  icon: text("icon"),
  parentId: int("parent_id"),
  isActive: boolean("is_active").default(true),
  sortOrder: int("sort_order").default(0),
  productCount: int("product_count").default(0),
  createdAt: datetime("created_at").$defaultFn(() => new Date()),
});

// ============ PRODUCTS ============
export const products = mysqlTable("products", {
  id: int("id").autoincrement().primaryKey(),
  name: varchar("name", { length: 500 }).notNull(),
  slug: varchar("slug", { length: 500 }).notNull().unique(),
  sku: varchar("sku", { length: 100 }),
  brandId: int("brand_id"),
  categoryId: int("category_id"),
  shortDescription: text("short_description"),
  description: text("description"),
  price: decimal("price", { precision: 12, scale: 2 }).notNull(),
  oldPrice: decimal("old_price", { precision: 12, scale: 2 }),
  discountPercent: int("discount_percent").default(0),
  monthlyPayment: decimal("monthly_payment", { precision: 12, scale: 2 }),
  inStock: boolean("in_stock").default(true),
  stockStatus: varchar("stock_status", { length: 50 }).default("in_stock"),
  isNew: boolean("is_new").default(false),
  isFeatured: boolean("is_featured").default(false),
  isHit: boolean("is_hit").default(false),
  isSale: boolean("is_sale").default(false),
  rating: decimal("rating", { precision: 3, scale: 1 }).default("5.0"),
  reviewCount: int("review_count").default(0),
  images: json("images").$type<string[]>().default([]),
  // Specs
  processor: varchar("processor", { length: 200 }),
  processorBrand: varchar("processor_brand", { length: 50 }),
  gpu: varchar("gpu", { length: 200 }),
  gpuBrand: varchar("gpu_brand", { length: 50 }),
  ram: varchar("ram", { length: 50 }),
  storage: varchar("storage", { length: 100 }),
  display: varchar("display", { length: 50 }),
  resolution: varchar("resolution", { length: 50 }),
  refreshRate: varchar("refresh_rate", { length: 30 }),
  matrixType: varchar("matrix_type", { length: 50 }),
  weight: varchar("weight", { length: 30 }),
  color: varchar("color", { length: 50 }),
  os: varchar("os", { length: 100 }),
  battery: varchar("battery", { length: 100 }),
  warranty: varchar("warranty", { length: 100 }).default("1 год"),
  ports: text("ports"),
  wifi: varchar("wifi", { length: 100 }),
  bluetooth: varchar("bluetooth", { length: 50 }),
  camera: varchar("camera", { length: 50 }),
  dimensions: varchar("dimensions", { length: 100 }),
  fullSpecs: json("full_specs").$type<Record<string, string>>().default({}),
  advantages: json("advantages").$type<string[]>().default([]),
  includes: text("includes"),
  seoTitle: varchar("seo_title", { length: 300 }),
  seoDescription: text("seo_description"),
  seoKeywords: text("seo_keywords"),
  sortOrder: int("sort_order").default(0),
  viewCount: int("view_count").default(0),
  isActive: boolean("is_active").default(true),
  createdAt: datetime("created_at").$defaultFn(() => new Date()),
  updatedAt: datetime("updated_at").$defaultFn(() => new Date()),
});

// ============ REVIEWS ============
export const reviews = mysqlTable("reviews", {
  id: int("id").autoincrement().primaryKey(),
  productId: int("product_id").notNull(),
  authorName: varchar("author_name", { length: 200 }).notNull(),
  authorInitials: varchar("author_initials", { length: 5 }),
  rating: int("rating").default(5),
  text: text("text").notNull(),
  source: varchar("source", { length: 50 }).default("site"),
  isApproved: boolean("is_approved").default(true),
  createdAt: datetime("created_at").$defaultFn(() => new Date()),
});

// ============ ORDERS / LEADS ============
export const leads = mysqlTable("leads", {
  id: int("id").autoincrement().primaryKey(),
  type: varchar("type", { length: 50 }).default("whatsapp"),
  productId: int("product_id"),
  productName: text("product_name"),
  name: varchar("name", { length: 200 }),
  phone: varchar("phone", { length: 30 }),
  email: varchar("email", { length: 200 }),
  message: text("message"),
  status: varchar("status", { length: 50 }).default("new"),
  createdAt: datetime("created_at").$defaultFn(() => new Date()),
});

// ============ BANNERS ============
export const banners = mysqlTable("banners", {
  id: int("id").autoincrement().primaryKey(),
  title: text("title").notNull(),
  subtitle: text("subtitle"),
  description: text("description"),
  buttonText: varchar("button_text", { length: 100 }),
  buttonUrl: text("button_url"),
  imageUrl: text("image_url"),
  badge: varchar("badge", { length: 100 }),
  price: decimal("price", { precision: 12, scale: 2 }),
  oldPrice: decimal("old_price", { precision: 12, scale: 2 }),
  type: varchar("type", { length: 50 }).default("hero"),
  isActive: boolean("is_active").default(true),
  sortOrder: int("sort_order").default(0),
  createdAt: datetime("created_at").$defaultFn(() => new Date()),
});

// ============ PROMOTIONS ============
export const promotions = mysqlTable("promotions", {
  id: int("id").autoincrement().primaryKey(),
  title: text("title").notNull(),
  description: text("description"),
  imageUrl: text("image_url"),
  badge: varchar("badge", { length: 100 }),
  buttonText: varchar("button_text", { length: 100 }),
  buttonUrl: text("button_url"),
  bgStyle: varchar("bg_style", { length: 50 }).default("orange"),
  isActive: boolean("is_active").default(true),
  endsAt: datetime("ends_at"),
  sortOrder: int("sort_order").default(0),
  createdAt: datetime("created_at").$defaultFn(() => new Date()),
});

// ============ SETTINGS ============
export const settings = mysqlTable("settings", {
  id: int("id").autoincrement().primaryKey(),
  key: varchar("key", { length: 100 }).notNull().unique(),
  value: text("value"),
  label: varchar("label", { length: 200 }),
  group: varchar("group", { length: 100 }),
  updatedAt: datetime("updated_at").$defaultFn(() => new Date()),
});

// ============ NEWSLETTER ============
export const newsletter = mysqlTable("newsletter", {
  id: int("id").autoincrement().primaryKey(),
  email: varchar("email", { length: 200 }).notNull().unique(),
  isActive: boolean("is_active").default(true),
  createdAt: datetime("created_at").$defaultFn(() => new Date()),
});
