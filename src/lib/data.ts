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
  if (url.startsWith("http://") || url.startsWith("https://") || url.startsWith("data:") || url.startsWith("blob:")) {
    return url;
  }
  const cleanPath = url.startsWith("/") ? url : `/${url}`;
  return `${BACKEND_BASE}${cleanPath}`;
}

/**
 * PHP API выдаёт CORS-заголовки, поэтому используем его напрямую и в браузере.
 * Это не зависит от TLS-прокси Vercel, который не принимает сертификат API.
 */
function productsApiUrl(query = ""): string {
  const isBrowser = typeof window !== "undefined";
  const base = `${!isBrowser
    ? (process.env.BACKEND_API_URL || "https://api.onepoint.kz")
    : "https://api.onepoint.kz"}/api/products.php`;

  const params = new URLSearchParams(query);
  if (isBrowser) {
    params.set("_t", Date.now().toString());
  }
  const qs = params.toString();
  return qs ? `${base}?${qs}` : base;
}

// In-memory and sessionStorage cache for zero-delay price loading
const liveCache: Map<string, Product> = new Map();

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
  if (typeof window === "undefined") return;
  const key = String(slugOrId);
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

export function normalizeDbProduct(p: any): Product {
  const price = Number(p.price) || 0;
  const oldPrice = p.old_price ? Number(p.old_price) : undefined;
  const discountPercent = (oldPrice && oldPrice > price) ? Math.round(((oldPrice - price) / oldPrice) * 100) : undefined;
  const saving = (oldPrice && oldPrice > price) ? (oldPrice - price) : undefined;

  return {
    id: Number(p.id),
    name: p.name || "",
    model: p.model || undefined,
    slug: p.slug || `product-${p.id}`,
    brand: p.brand || "Ноутбуки",
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
    color: p.color || "Grey",
    weight: p.weight || "2.1 кг",
    processor: p.processor || "Intel Core",
    processorBrand: p.processor ? p.processor.split(" ")[0] : "Intel",
    gpu: p.gpu || "GeForce RTX",
    gpuBrand: p.gpu ? p.gpu.split(" ")[0] : "NVIDIA",
    ram: p.ram || "16 ГБ",
    storage: p.storage || "512 ГБ SSD",
    display: p.display_size || '15.6"',
    resolution: p.resolution || "1920×1080",
    refreshRate: p.refresh_rate || "144 Гц",
    matrixType: p.matrix_type || "IPS",
    warranty: p.warranty || "1 год",
    os: p.os || "Windows 11",
    battery: p.battery || "60 Вт·ч",
    wifi: p.wifi || "Wi-Fi 6",
    bluetooth: p.bluetooth || "5.1",
    camera: p.camera || "720p",
    dimensions: p.dimensions || "",
    ports: p.ports || "",
    keyboard: p.keyboard || undefined,
    shortDescription: p.short_description || "",
    description: p.description || "",
    advantages: p.advantages ? (Array.isArray(p.advantages) ? p.advantages : String(p.advantages).split("\n")) : [],
    whyBuyText: p.why_buy_text || undefined,
    frequentlyBoughtIds: p.frequently_bought_ids || undefined,
    equipment: p.equipment || undefined,
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
    reviews: p.reviews || [],
    related: p.related ? p.related.map((r: any) => normalizeDbProduct(r)) : [],
    sortOrder: Number(p.sort_order) || 0,
    condition: p.product_condition || (Number(p.is_new) === 1 ? "Новый" : "Б/У"),
    dynamicCharacteristics: p.dynamic_characteristics || [],
    cardProcessor: p.card_processor || undefined,
    cardGpu: p.card_gpu || undefined,
    cardRam: p.card_ram || undefined,
    cardStorage: p.card_storage || undefined,
    metaTitle: p.meta_title || undefined,
    metaDescription: p.meta_description || undefined,
    h1: p.h1 || undefined,
    imageAlt: p.image_alt || undefined,
    createdAt: p.created_at || undefined,
    categories: p.categories && Array.isArray(p.categories) ? p.categories : (p.category_slug ? [p.category_slug] : []),
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

function getFetchOptions(): RequestInit {
  if (typeof window !== "undefined") {
    // In browser, the URL already includes anti-cache timestamp (?_t=...).
    // Do NOT send custom Cache-Control request headers to prevent CORS preflight blocks.
    return {};
  }
  return { next: { revalidate: 60 } };
}

export async function fetchLiveProducts(): Promise<Product[]> {
  try {
    const res = await fetch(productsApiUrl(), getFetchOptions());
    if (!res.ok) return [];
    const data = await res.json();
    if (Array.isArray(data.products)) {
      const normalized = data.products.map(normalizeDbProduct);
      saveToLiveCache(normalized);
      return normalized;
    }
  } catch (e) {
    console.error("Failed to fetch live products:", e);
  }
  return [];
}

export async function fetchLiveBrands(): Promise<{name: string, slug: string}[]> {
  try {
    const res = await fetch(productsApiUrl("brands=1"), getFetchOptions());
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
}

export async function fetchLiveProductsByFlag(flag: "is_hit" | "is_new" | "is_sale"): Promise<Product[]> {
  try {
    const apiFlag = flag.replace(/^is_/, "");
    const res = await fetch(productsApiUrl(`${apiFlag}=1`), getFetchOptions());
    if (!res.ok) return [];
    const data = await res.json();
    if (Array.isArray(data.products)) {
      const normalized = data.products.map(normalizeDbProduct);
      saveToLiveCache(normalized);
      return normalized;
    }
  } catch (e) {
    console.error(`Failed to fetch live products by flag ${flag}:`, e);
  }
  return [];
}

export async function fetchLiveProductBySlug(slug: string): Promise<Product | null> {
  try {
    const res = await fetch(productsApiUrl(`slug=${encodeURIComponent(slug)}`), getFetchOptions());
    if (res.ok) {
      const data = await res.json();
      if (data.product) {
        const normalized = normalizeDbProduct(data.product);
        saveToLiveCache([normalized], true);
        return normalized;
      }
    }
    // If response is not ok or product not in DB (e.g. 404)
    removeProductFromCache(slug);
  } catch (e) {
    console.error(`Failed to fetch product by slug ${slug}:`, e);
  }
  return null;
}

export async function fetchSettings(): Promise<Record<string, string>> {
  try {
    const isBrowser = typeof window !== "undefined";
    const base = `${!isBrowser
      ? (process.env.BACKEND_API_URL || "https://api.onepoint.kz")
      : "https://api.onepoint.kz"}/api/settings.php${isBrowser ? `?_t=${Date.now()}` : ""}`;
    const res = await fetch(base, getFetchOptions());
    if (res.ok) {
      const data = await res.json();
      return data.settings || {};
    }
  } catch (e) {
    console.error(`Failed to fetch settings:`, e);
  }
  return {};
}

export function formatPrice(price: number): string {
  return price.toLocaleString("ru-KZ") + " ₸";
}

export async function fetchLiveReviews(): Promise<any[]> {
  try {
    const isBrowser = typeof window !== "undefined";
    const base = `${!isBrowser
      ? (process.env.BACKEND_API_URL || "https://api.onepoint.kz")
      : "https://api.onepoint.kz"}/api/products.php?reviews=1${isBrowser ? `&_t=${Date.now()}` : ""}`;
    const res = await fetch(base, getFetchOptions());
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
}

