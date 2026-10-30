// ============ BRANDS & CATEGORIES DATA ============

export interface Product {
  id: number;
  name: string;
  model?: string;
  slug: string;
  brand: string;
  series?: string;
  sku?: string;
  categorySlug: string;
  categoryName: string;
  categories?: string[];
  price: number;
  oldPrice?: number;
  discountPercent?: number;
  saving?: number;
  image: string;
  inStock: boolean;
  stockStatus: "in_stock" | "out_of_stock";
  isNew: boolean;
  isHit: boolean;
  isSale: boolean;
  rating: number;
  reviewCount: number;
  color?: string;
  weight?: string;
  processor?: string;
  processorBrand?: string;
  gpu?: string;
  gpuBrand?: string;
  ram?: string;
  storage?: string;
  display?: string;
  resolution?: string;
  refreshRate?: string;
  matrixType?: string;
  warranty?: string;
  os?: string;
  battery?: string;
  wifi?: string;
  bluetooth?: string;
  camera?: string;
  dimensions?: string;
  ports?: string;
  keyboard?: string;
  shortDescription?: string;
  description?: string;
  advantages?: string[];
  whyBuyText?: string;
  frequentlyBoughtIds?: string;
  equipment?: string;
  bgGradient?: string;
  svgColor1?: string;
  svgColor2?: string;
  images?: string[];
  reviews?: any[];
  related?: any[];
  sortOrder?: number;
  isUpcoming?: boolean;
  condition?: string;
  dynamicCharacteristics?: {name: string, value: string}[];
  cardProcessor?: string;
  cardGpu?: string;
  cardRam?: string;
  cardStorage?: string;
  metaTitle?: string;
  metaDescription?: string;
  h1?: string;
  imageAlt?: string;
  createdAt?: string;
}

export const PRODUCTS: Product[] = [];

export const BACKEND_BASE = "https://api.onepoint.kz";

export function productImageUrl(value: unknown): string {
  const url = typeof value === "string" ? value.trim() : "";
  if (!url) return "";
  if (url.startsWith("http://")) {
    return url.replace(/^http:\/\//i, "https://");
  }
  if (url.startsWith("https://") || url.startsWith("data:") || url.startsWith("blob:")) {
    return url;
  }
  const cleanPath = url.startsWith("/") ? url : `/${url}`;
  return `${BACKEND_BASE}${cleanPath}`;
}

/**
 * PHP API выдаёт CORS-заголовки, поэтому используем его напрямую и в браузере.
 * Это не зависит от TLS-прокси Vercel, который не принимает сертификат API.
 */
function productsApiUrl(query = "", forceRefresh = false): string {
  const isBrowser = typeof window !== "undefined";
  const base = `${!isBrowser
    ? (process.env.BACKEND_API_URL || "https://api.onepoint.kz")
    : "https://api.onepoint.kz"}/api/products.php`;

  const params = new URLSearchParams(query);
  if (forceRefresh) {
    params.set("_t", Date.now().toString());
  }
  const qs = params.toString();
  return qs ? `${base}?${qs}` : base;
}

// In-memory and sessionStorage cache for zero-delay price loading
const liveCache: Map<string, Product> = new Map();

// High-performance server & client in-memory cache with TTL and promise coalescing
interface CacheRecord<T> {
  data: T;
  timestamp: number;
}
const memoryCache = new Map<string, CacheRecord<any>>();
const inFlightRequests = new Map<string, Promise<any>>();

export const TTL_PRODUCTS = 2 * 60 * 1000;       // 2 minutes
export const TTL_PRODUCT_SINGLE = 2 * 60 * 1000; // 2 minutes
export const TTL_BRANDS = 10 * 60 * 1000;        // 10 minutes
export const TTL_SETTINGS = 5 * 60 * 1000;       // 5 minutes
export const TTL_REVIEWS = 5 * 60 * 1000;        // 5 minutes

async function cachedFetch<T>(
  key: string,
  ttlMs: number,
  fetcher: () => Promise<T>,
  forceRefresh = false
): Promise<T> {
  if (!forceRefresh) {
    const cached = memoryCache.get(key);
    if (cached && Date.now() - cached.timestamp < ttlMs) {
      return cached.data as T;
    }
  }

  // Request coalescing: reuse active promise to prevent duplicate concurrent network queries
  const inFlight = inFlightRequests.get(key);
  if (inFlight) {
    return inFlight as Promise<T>;
  }

  const promise = (async () => {
    try {
      const data = await fetcher();
      if (data !== undefined && data !== null) {
        memoryCache.set(key, { data, timestamp: Date.now() });
      }
      return data;
    } finally {
      inFlightRequests.delete(key);
    }
  })();

  inFlightRequests.set(key, promise);
  return promise;
}

function saveToLiveCache(products: Product[], appendOnly = false) {
  if (typeof window === "undefined") return;
  if (!appendOnly) {
    liveCache.clear();
  }
  products.forEach(p => {
    if (p.slug) liveCache.set(p.slug, p);
    if (p.id) liveCache.set(String(p.id), p);
  });
  try {
    const list = Array.from(new Set(Array.from(liveCache.values())));
    sessionStorage.setItem("op_live_products", JSON.stringify(list));
  } catch (_) {}
}

export function removeProductFromCache(slugOrId: string | number) {
  const key = String(slugOrId).toLowerCase();
  memoryCache.delete(`product:${key}`);
  if (typeof window === "undefined") return;
  liveCache.delete(key);
  try {
    const saved = sessionStorage.getItem("op_live_products");
    if (saved) {
      const parsed: Product[] = JSON.parse(saved);
      const filtered = parsed.filter(p => p.slug !== key && String(p.id) !== key);
      sessionStorage.setItem("op_live_products", JSON.stringify(filtered));
    }
  } catch (_) {}
}

export function getCachedProduct(slugOrId: string | number): Product | null {
  if (typeof window === "undefined") return null;
  const key = String(slugOrId);
  if (liveCache.has(key)) return liveCache.get(key)!;
  try {
    const saved = sessionStorage.getItem("op_live_products");
    if (saved) {
      const parsed: Product[] = JSON.parse(saved);
      parsed.forEach(p => {
        if (p.slug) liveCache.set(p.slug, p);
        if (p.id) liveCache.set(String(p.id), p);
      });
      if (liveCache.has(key)) return liveCache.get(key)!;
    }
  } catch (_) {}
  return null;
}

export const CATEGORIES = [
  { slug: "gaming", name: "Игровые ноутбуки", icon: "gamepad", count: 128, desc: "RTX 5060/5070/5080, высокочастотные дисплеи" },
  { slug: "office", name: "Для работы", icon: "briefcase", count: 96, desc: "Офисные и деловые ноутбуки" },
  { slug: "student", name: "Для учёбы", icon: "book", count: 64, desc: "Доступные ноутбуки для студентов" },
  { slug: "ultrabook", name: "Ультрабуки", icon: "zap", count: 52, desc: "Тонкие и лёгкие, до 1.5 кг" },
  { slug: "macbook", name: "MacBook", icon: "apple", count: 22, desc: "Apple MacBook Air и Pro" },
  { slug: "pro", name: "Профессиональные", icon: "cpu", count: 40, desc: "Высокая производительность для любых задач" },
  { slug: "designer", name: "Для дизайнеров", icon: "palette", count: 31, desc: "OLED, цветоточные экраны, Quadro" },
  { slug: "dev", name: "Для разработчиков", icon: "code", count: 44, desc: "RAM 32+ ГБ, Linux ready" },
  { slug: "video", name: "Для видеомонтажа", icon: "film", count: 28, desc: "RTX, большой SSD, цветоточный дисплей" },
  { slug: "rtx", name: "Ноутбуки с RTX", icon: "cpu", count: 87, desc: "NVIDIA GeForce RTX 40/50 серии" },
  { slug: "oled", name: "Ноутбуки с OLED", icon: "monitor", count: 34, desc: "OLED-матрица для идеальной картинки" },
  { slug: "business", name: "Для бизнеса", icon: "target", count: 45, desc: "Корпоративные решения" },
];

export const BRANDS = [
  { name: "ASUS", slug: "asus" },
  { name: "Lenovo", slug: "lenovo" },
  { name: "HP", slug: "hp" },
  { name: "Acer", slug: "acer" },
  { name: "Dell", slug: "dell" },
  { name: "MSI", slug: "msi" },
  { name: "Apple", slug: "apple" },
  { name: "Samsung", slug: "samsung" },
  { name: "Gigabyte", slug: "gigabyte" },
  { name: "Huawei", slug: "huawei" },
  { name: "Honor", slug: "honor" },
];

export const REVIEWS = [
  { author: "Данияр Т.", initials: "ДТ", color: "linear-gradient(135deg,#FF5A1F,#FF8A50)", product: "ASUS ROG Strix G16", rating: 5, text: "Взял ROG Strix для стрима и монтажа — тянет всё без единой просадки. Доставили на следующий день, курьер сам всё распаковал и помог настроить.", source: "2GIS" },
  { author: "Айгерим К.", initials: "АК", color: "linear-gradient(135deg,#6b6b72,#3a3a40)", product: "Lenovo Legion Pro 5", rating: 5, text: "Купила Legion Pro 5 — всё прошло отлично. Ноутбук пришёл в идеальной упаковке, консультант помог с переносом данных.", source: "2GIS" },
  { author: "Руслан М.", initials: "РМ", color: "linear-gradient(135deg,#1AA35C,#2ECC71)", product: "HP Omen 16", rating: 5, text: "HP Omen 16 — лучший ноутбук, которым я владел. Экран потрясающий, батарея на удивление долго держит. OnePoint — рекомендую всем!", source: "2GIS" },
  { author: "Серик А.", initials: "СА", color: "linear-gradient(135deg,#3B82F6,#60A5FA)", product: "Lenovo IdeaPad Slim 3", rating: 5, text: "Брал ноутбук для дочери на учёбу. Отличный выбор за эти деньги! Быстро работает, красивый дизайн. Спасибо OnePoint за профессиональную консультацию.", source: "2GIS" },
  { author: "Малика Б.", initials: "МБ", color: "linear-gradient(135deg,#A855F7,#C084FC)", product: "ASUS TUF Gaming F16", rating: 5, text: "Долго выбирала первый игровой ноутбук — помогли подобрать TUF F16. Играю в сложные игры на максималках. Очень довольна покупкой!", source: "2GIS" },
  { author: "Болат И.", initials: "БИ", color: "linear-gradient(135deg,#EF4444,#F87171)", product: "HP OmniBook 5", rating: 5, text: "Ноутбук для командировок — OmniBook 5 идеален. Лёгкий, быстрый, заряда хватает на весь день. Оформление и доставка — супер.", source: "2GIS" },
];

export function detectBrand(name?: string, brand?: string): string {
  if (brand && typeof brand === "string" && brand !== "null" && brand !== "Ноутбуки" && brand.trim()) {
    return brand.trim();
  }
  const n = (name || "").toLowerCase();
  if (n.includes("asus") || n.includes("rog") || n.includes("tuf") || n.includes("zenbook")) return "ASUS";
  if (n.includes("lenovo") || n.includes("thinkpad") || n.includes("ideapad") || n.includes("legion") || n.includes("yoga") || n.includes("loq")) return "Lenovo";
  if (n.includes("hp") || n.includes("omnibook") || n.includes("victus") || n.includes("omen") || n.includes("pavilion") || n.includes("probook") || n.includes("elitebook")) return "HP";
  if (n.includes("acer") || n.includes("swift") || n.includes("nitro") || n.includes("predator") || n.includes("aspire")) return "Acer";
  if (n.includes("msi") || n.includes("cyborg") || n.includes("vector") || n.includes("stealth") || n.includes("titan") || n.includes("raider") || n.includes("katana")) return "MSI";
  if (n.includes("apple") || n.includes("macbook")) return "Apple";
  if (n.includes("samsung") || n.includes("galaxy book")) return "Samsung";
  if (n.includes("huawei") || n.includes("matebook")) return "Huawei";
  if (n.includes("honor") || n.includes("magicbook")) return "Honor";
  if (n.includes("dell") || n.includes("alienware") || n.includes("xps") || n.includes("latitude") || n.includes("vostro") || n.includes("inspiron")) return "Dell";
  if (n.includes("gigabyte") || n.includes("aorus")) return "Gigabyte";
  return "OnePoint";
}

export function normalizeDbProduct(p: any): Product {
  const price = Number(p.price) || 0;
  const oldPrice = p.old_price ? Number(p.old_price) : undefined;
  const discountPercent = (oldPrice && oldPrice > price) ? Math.round(((oldPrice - price) / oldPrice) * 100) : undefined;
  const saving = (oldPrice && oldPrice > price) ? (oldPrice - price) : undefined;
  const brand = detectBrand(p.name, p.brand);

  return {
    id: Number(p.id),
    name: p.name || "",
    model: p.model || undefined,
    slug: p.slug || `product-${p.id}`,
    brand,
    series: p.series || "",
    sku: p.sku || `OP-${p.id}`,
    categorySlug: p.category_slug || "gaming",
    categoryName: p.category || "Ноутбуки",
    price,
    oldPrice,
    discountPercent,
    saving,
    // Empty image is intentional: the card will show its visual fallback only
    // when the product has no main image in the database.
    image: productImageUrl(p.image_url),
    inStock: Number(p.in_stock) === 1,
    stockStatus: Number(p.in_stock) === 1 ? "in_stock" : "out_of_stock",
    isNew: (p.created_at && (Date.now() - new Date(p.created_at).getTime()) > 30 * 24 * 60 * 60 * 1000) ? false : (Number(p.is_new) === 1),
    isHit: Number(p.is_hit) === 1,
    isSale: Number(p.is_sale) === 1,
    isUpcoming: Number(p.is_upcoming) === 1,
    rating: Number(p.rating) || 5.0,
    reviewCount: Number(p.review_count) || 0,
    color: p.color ? String(p.color) : "Grey",
    weight: p.weight ? String(p.weight) : "2.1 кг",
    processor: p.processor ? String(p.processor) : "Intel Core",
    processorBrand: p.processor ? String(p.processor).split(" ")[0] : "Intel",
    gpu: p.gpu ? String(p.gpu) : "GeForce RTX",
    gpuBrand: p.gpu ? String(p.gpu).split(" ")[0] : "NVIDIA",
    ram: p.ram ? String(p.ram) : "16 ГБ",
    storage: p.storage ? String(p.storage) : "512 ГБ SSD",
    display: p.display_size ? String(p.display_size) : '15.6"',
    resolution: p.resolution ? String(p.resolution) : "1920×1080",
    refreshRate: p.refresh_rate ? String(p.refresh_rate) : "144 Гц",
    matrixType: p.matrix_type ? String(p.matrix_type) : "IPS",
    warranty: p.warranty ? String(p.warranty) : "1 год",
    os: p.os ? String(p.os) : "Windows 11",
    battery: p.battery ? String(p.battery) : "60 Вт·ч",
    wifi: p.wifi ? String(p.wifi) : "Wi-Fi 6",
    bluetooth: p.bluetooth ? String(p.bluetooth) : "5.1",
    camera: p.camera ? String(p.camera) : "720p",
    dimensions: p.dimensions ? String(p.dimensions) : "",
    ports: p.ports ? String(p.ports) : "",
    keyboard: p.keyboard ? String(p.keyboard) : undefined,
    shortDescription: p.short_description ? String(p.short_description) : "",
    description: p.description ? String(p.description) : "",
    advantages: p.advantages ? (Array.isArray(p.advantages) ? p.advantages.filter((a: any) => typeof a === "string") : String(p.advantages).split("\n")) : [],
    whyBuyText: p.why_buy_text ? String(p.why_buy_text) : undefined,
    frequentlyBoughtIds: p.frequently_bought_ids ? String(p.frequently_bought_ids) : undefined,
    equipment: p.equipment ? String(p.equipment) : undefined,
    bgGradient: "linear-gradient(150deg,#F1E9FB,#EAE1F9)",
    svgColor1: "#5b2a86",
    svgColor2: "#ff5a1f",
    // gallery = array of objects (single product endpoint), gallery_images = array of strings (list endpoint)
    images: (() => {
      const mainImg = productImageUrl(p.image_url);
      let list: string[] = [];
      if (p.gallery && Array.isArray(p.gallery)) {
        list = p.gallery.map((g: any) => productImageUrl(g.image_url)).filter(Boolean);
      } else if (p.gallery_images && Array.isArray(p.gallery_images) && p.gallery_images.length > 0) {
        list = p.gallery_images.map((url: string) => productImageUrl(url)).filter(Boolean);
      }
      if (mainImg) {
        list = [mainImg, ...list.filter(url => url !== mainImg)];
      } else if (list.length === 0 && p.image_url) {
        list = [productImageUrl(p.image_url)];
      }
      return list;
    })(),
    reviews: Array.isArray(p.reviews) ? p.reviews : [],
    related: p.related && Array.isArray(p.related) ? p.related.map((r: any) => normalizeDbProduct(r)) : [],
    sortOrder: Number(p.sort_order) || 0,
    condition: p.product_condition || (Number(p.is_new) === 1 ? "Новый" : "Б/У"),
    dynamicCharacteristics: Array.isArray(p.dynamic_characteristics) ? p.dynamic_characteristics : [],
    cardProcessor: p.card_processor ? String(p.card_processor) : undefined,
    cardGpu: p.card_gpu ? String(p.card_gpu) : undefined,
    cardRam: p.card_ram ? String(p.card_ram) : undefined,
    cardStorage: p.card_storage ? String(p.card_storage) : undefined,
    metaTitle: p.meta_title ? String(p.meta_title) : undefined,
    metaDescription: p.meta_description ? String(p.meta_description) : undefined,
    h1: p.h1 ? String(p.h1) : undefined,
    imageAlt: p.image_alt ? String(p.image_alt) : undefined,
    createdAt: p.created_at ? String(p.created_at) : undefined,
    categories: Array.isArray(p.categories)
      ? p.categories
          .map((c: any) => (typeof c === "string" ? c.trim() : c && typeof c === "object" && c.slug ? String(c.slug).trim() : typeof c === "number" ? String(c) : ""))
          .filter(Boolean)
      : (p.category_slug ? [String(p.category_slug).trim()] : []),
  };
}

export function formatGpu(gpu?: string): string {
  if (!gpu) return "—";
  let cleaned = gpu.replace(/NVIDIA|GeForce|AMD|Radeon|Intel/ig, "").trim();
  // Standardize Wattage to "140W"
  cleaned = cleaned.replace(/(\d+)\s*(W|Вт)/ig, "$1W");
  cleaned = cleaned.replace(/\s+/g, " ");
  // If it's just a number like "4060" without RTX, leave it, but usually it's "RTX 4060"
  return cleaned || gpu;
}

function getFetchOptions(revalidateSeconds = 60): RequestInit {
  if (typeof window !== "undefined") {
    return {};
  }
  return { next: { revalidate: revalidateSeconds } };
}

export async function fetchLiveProducts(forceRefresh = false): Promise<Product[]> {
  return cachedFetch(
    "products:all",
    TTL_PRODUCTS,
    async () => {
      try {
        const res = await fetch(productsApiUrl("", forceRefresh), getFetchOptions(120));
        if (!res.ok) return [];
        const data = await res.json();
        if (Array.isArray(data.products)) {
          const normalized: Product[] = data.products.map(normalizeDbProduct);
          saveToLiveCache(normalized);
          // Pre-populate individual product caches for instant slug/id lookups
          normalized.forEach((p: Product) => {
            if (p.slug) {
              memoryCache.set(`product:${p.slug.toLowerCase()}`, { data: p, timestamp: Date.now() });
            }
            if (p.id) {
              memoryCache.set(`product:${p.id}`, { data: p, timestamp: Date.now() });
            }
          });
          return normalized;
        }
      } catch (e) {
        console.error("Failed to fetch live products:", e);
      }
      return [];
    },
    forceRefresh
  );
}

export async function fetchLiveBrands(forceRefresh = false): Promise<{name: string, slug: string}[]> {
  return cachedFetch(
    "brands:all",
    TTL_BRANDS,
    async () => {
      try {
        const res = await fetch(productsApiUrl("brands=1", forceRefresh), getFetchOptions(600));
        if (!res.ok) return [];
        const data = await res.json();
        if (Array.isArray(data.brands)) {
          return data.brands.map((b: any) => ({
            name: b.name,
            slug: b.slug || b.name.toLowerCase()
          }));
        }
      } catch (e) {
        console.error("Failed to fetch live brands:", e);
      }
      return [];
    },
    forceRefresh
  );
}

export async function fetchLiveCategories(forceRefresh = false): Promise<{ id: string; name: string; slug: string; productCount?: number }[]> {
  return cachedFetch(
    "categories:all",
    TTL_BRANDS,
    async () => {
      try {
        const res = await fetch(productsApiUrl("categories=1", forceRefresh), getFetchOptions(600));
        if (!res.ok) return [];
        const data = await res.json();
        if (Array.isArray(data.categories)) {
          return data.categories.map((c: any) => ({
            id: String(c.id),
            name: c.name,
            slug: c.slug,
            productCount: Number(c.product_count) || 0
          }));
        }
      } catch (e) {
        console.error("Failed to fetch live categories:", e);
      }
      return [];
    },
    forceRefresh
  );
}

export async function fetchLiveProductsByFlag(flag: "is_hit" | "is_new" | "is_sale", forceRefresh = false): Promise<Product[]> {
  return cachedFetch(
    `products:flag:${flag}`,
    TTL_PRODUCTS,
    async () => {
      try {
        const apiFlag = flag.replace(/^is_/, "");
        const res = await fetch(productsApiUrl(`${apiFlag}=1`, forceRefresh), getFetchOptions(120));
        if (!res.ok) return [];
        const data = await res.json();
        if (Array.isArray(data.products)) {
          const normalized = data.products.map(normalizeDbProduct);
          saveToLiveCache(normalized, true);
          return normalized;
        }
      } catch (e) {
        console.error(`Failed to fetch live products by flag ${flag}:`, e);
      }
      return [];
    },
    forceRefresh
  );
}

export async function fetchLiveProductBySlug(slug: string, forceRefresh = false): Promise<Product | null> {
  if (!slug) return null;
  const cleanSlug = decodeURIComponent(slug).trim();
  const cacheKey = `product:${cleanSlug.toLowerCase()}`;

  return cachedFetch(
    cacheKey,
    TTL_PRODUCT_SINGLE,
    async () => {
      // 1. Direct fetch by slug from PHP backend with 2 min ISR revalidation
      try {
        const res = await fetch(productsApiUrl(`slug=${encodeURIComponent(cleanSlug)}`, forceRefresh), getFetchOptions(120));
        if (res.ok) {
          const data = await res.json();
          if (data && data.product) {
            const normalized = normalizeDbProduct(data.product);
            saveToLiveCache([normalized], true);
            return normalized;
          }
        }
      } catch (e) {
        console.error(`Direct fetch by slug ${cleanSlug} failed:`, e);
      }

      // 2. Fallback: Search in live products list (uses in-memory cached catalog)
      try {
        const allProducts = await fetchLiveProducts();
        if (allProducts && allProducts.length > 0) {
          const lowerClean = cleanSlug.toLowerCase();
          const found = allProducts.find(
            (p) =>
              p.slug === cleanSlug ||
              (p.slug && p.slug.toLowerCase() === lowerClean) ||
              String(p.id) === cleanSlug ||
              `product-${p.id}` === lowerClean ||
              (p.sku && p.sku.toLowerCase() === lowerClean) ||
              (p.model && p.model.toLowerCase().replace(/[^a-z0-9]+/g, "-") === lowerClean)
          );
          if (found) {
            saveToLiveCache([found], true);
            return found;
          }
        }
      } catch (e) {
        console.error(`Fallback product lookup failed for ${cleanSlug}:`, e);
      }

      // 3. Fallback: Cached product in browser memory
      if (typeof window !== "undefined") {
        const cached = getCachedProduct(cleanSlug);
        if (cached) return cached;
      }

      return null;
    },
    forceRefresh
  );
}

export async function fetchSettings(forceRefresh = false): Promise<Record<string, string>> {
  return cachedFetch(
    "settings:all",
    TTL_SETTINGS,
    async () => {
      try {
        const isBrowser = typeof window !== "undefined";
        const base = `${!isBrowser
          ? (process.env.BACKEND_API_URL || "https://api.onepoint.kz")
          : "https://api.onepoint.kz"}/api/settings.php${forceRefresh ? `?_t=${Date.now()}` : ""}`;
        const res = await fetch(base, getFetchOptions(300));
        if (res.ok) {
          const data = await res.json();
          return data.settings || {};
        }
      } catch (e) {
        console.error(`Failed to fetch settings:`, e);
      }
      return {};
    },
    forceRefresh
  );
}

export function formatPrice(price: number): string {
  return price.toLocaleString("ru-KZ") + " ₸";
}

export async function fetchLiveReviews(forceRefresh = false): Promise<any[]> {
  return cachedFetch(
    "reviews:all",
    TTL_REVIEWS,
    async () => {
      try {
        const isBrowser = typeof window !== "undefined";
        const base = `${!isBrowser
          ? (process.env.BACKEND_API_URL || "https://api.onepoint.kz")
          : "https://api.onepoint.kz"}/api/products.php?reviews=1${forceRefresh ? `&_t=${Date.now()}` : ""}`;
        const res = await fetch(base, getFetchOptions(300));
        if (res.ok) {
          const data = await res.json();
          if (Array.isArray(data.reviews) && data.reviews.length > 0) {
            return data.reviews;
          }
        }
      } catch (e) {
        console.error(`Failed to fetch live reviews:`, e);
      }
      return [];
    },
    forceRefresh
  );
}

