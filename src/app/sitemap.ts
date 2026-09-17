import { MetadataRoute } from "next";
import { fetchLiveProducts, CATEGORIES, BRANDS } from "@/lib/data";

export const dynamic = "force-dynamic";
export const revalidate = 3600;

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://onepoint.kz";

  let products: any[] = [];
  try {
    products = await fetchLiveProducts();
  } catch (e) {
    console.error("Sitemap fetchLiveProducts error:", e);
  }

  // 1. Core Pages
  const staticPages: MetadataRoute.Sitemap = [
    {
      url: `${baseUrl}`,
      lastModified: new Date(),
      changeFrequency: "daily",
      priority: 1.0,
    },
    {
      url: `${baseUrl}/catalog`,
      lastModified: new Date(),
      changeFrequency: "daily",
      priority: 0.9,
    },
    {
      url: `${baseUrl}/bestsellers`,
      lastModified: new Date(),
      changeFrequency: "daily",
      priority: 0.85,
    },
    {
      url: `${baseUrl}/promotions`,
      lastModified: new Date(),
      changeFrequency: "daily",
      priority: 0.85,
    },
    {
      url: `${baseUrl}/new-arrivals`,
      lastModified: new Date(),
      changeFrequency: "daily",
      priority: 0.85,
    },
    {
      url: `${baseUrl}/categories`,
      lastModified: new Date(),
      changeFrequency: "weekly",
      priority: 0.8,
    },
    {
      url: `${baseUrl}/delivery`,
      lastModified: new Date(),
      changeFrequency: "monthly",
      priority: 0.6,
    },
    {
      url: `${baseUrl}/guarantee`,
      lastModified: new Date(),
      changeFrequency: "monthly",
      priority: 0.6,
    },
    {
      url: `${baseUrl}/payment`,
      lastModified: new Date(),
      changeFrequency: "monthly",
      priority: 0.6,
    },
    {
      url: `${baseUrl}/contacts`,
      lastModified: new Date(),
      changeFrequency: "monthly",
      priority: 0.6,
    },
    {
      url: `${baseUrl}/faq`,
      lastModified: new Date(),
      changeFrequency: "monthly",
      priority: 0.5,
    },
    {
      url: `${baseUrl}/about`,
      lastModified: new Date(),
      changeFrequency: "monthly",
      priority: 0.5,
    },
    {
      url: `${baseUrl}/privacy`,
      lastModified: new Date(),
      changeFrequency: "yearly",
      priority: 0.3,
    },
  ];

  // 2. Categories
  const categoryUrls: MetadataRoute.Sitemap = CATEGORIES.map((cat) => ({
    url: `${baseUrl}/catalog?cat=${cat.slug}`,
    lastModified: new Date(),
    changeFrequency: "weekly" as const,
    priority: 0.7,
  }));

  // 3. Brands
  const brandUrls: MetadataRoute.Sitemap = BRANDS.map((b) => ({
    url: `${baseUrl}/catalog?brand=${b.slug}`,
    lastModified: new Date(),
    changeFrequency: "weekly" as const,
    priority: 0.7,
  }));

  // 4. Products (deduplicated by slug)
  const seenSlugs = new Set<string>();
  const productUrls: MetadataRoute.Sitemap = [];

  for (const product of products) {
    if (product.slug && !seenSlugs.has(product.slug)) {
      seenSlugs.add(product.slug);
      productUrls.push({
        url: `${baseUrl}/product/${product.slug}`,
        lastModified: product.createdAt ? new Date(product.createdAt) : new Date(),
        changeFrequency: "daily" as const,
        priority: 0.8,
      });
    }
  }

  return [...staticPages, ...categoryUrls, ...brandUrls, ...productUrls];
}
