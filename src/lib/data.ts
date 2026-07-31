// ============ BRANDS & CATEGORIES DATA ============

export interface Product {
  id: number;
  name: string;
  slug: string;
  brand: string;
  series?: string;
  sku?: string;
  categorySlug: string;
  categoryName: string;
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
  shortDescription?: string;
  description?: string;
  advantages?: string[];
  whyBuyText?: string;
  frequentlyBoughtIds?: string;
  bgGradient?: string;
  svgColor1?: string;
  svgColor2?: string;
  images?: string[];
  reviews?: any[];
  related?: any[];
  sortOrder?: number;
}

export const PRODUCTS: Product[] = [];

function productImageUrl(value: unknown): string {
  const url = typeof value === "string" ? value.trim() : "";
  if (!url) return "";
  return url.startsWith("/") ? `https://api.onepoint.kz${url}` : url;
}

/**
 * PHP API выдаёт CORS-заголовки, поэтому используем его напрямую и в браузере.
 * Это не зависит от TLS-прокси Vercel, который не принимает сертификат API.
 */
function productsApiUrl(query = ""): string {
  const base = `${typeof window === "undefined"
    ? (process.env.BACKEND_API_URL || "https://api.onepoint.kz")
    : "https://api.onepoint.kz"}/api/products.php`;

  return query ? `${base}?${query}` : base;
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
  { slug: "accessories", name: "Аксессуары", icon: "package", count: 210, desc: "Мыши, сумки, коврики, хабы" },
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
    id: p.id,
    name: p.name || "",
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
    inStock: Boolean(p.in_stock),
    stockStatus: p.in_stock ? "in_stock" : "out_of_stock",
    isNew: Boolean(p.is_new),
    isHit: Boolean(p.is_hit),
    isSale: Boolean(p.is_sale),
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
    shortDescription: p.short_description || "",
    description: p.description || "",
    advantages: p.advantages ? (Array.isArray(p.advantages) ? p.advantages : String(p.advantages).split("\n")) : [],
    whyBuyText: p.why_buy_text || undefined,
    frequentlyBoughtIds: p.frequently_bought_ids || undefined,
    bgGradient: "linear-gradient(150deg,#F1E9FB,#EAE1F9)",
    svgColor1: "#5b2a86",
    svgColor2: "#ff5a1f",
    images: p.gallery ? p.gallery.map((g: any) => productImageUrl(g.image_url)) : (p.image_url ? [productImageUrl(p.image_url)] : []),
    reviews: p.reviews || [],
    related: p.related ? p.related.map((r: any) => normalizeDbProduct(r)) : [],
    sortOrder: Number(p.sort_order) || 0,
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

export async function fetchLiveProducts(): Promise<Product[]> {
  try {
    const res = await fetch(productsApiUrl(), { cache: "no-store" });
    if (!res.ok) return [];
    const data = await res.json();
    if (Array.isArray(data.products)) {
      return data.products.map(normalizeDbProduct);
    }
  } catch (e) {
    console.error("Failed to fetch live products:", e);
  }
  return [];
}

export async function fetchLiveProductsByFlag(flag: "is_hit" | "is_new" | "is_sale"): Promise<Product[]> {
  try {
    const apiFlag = flag.replace(/^is_/, "");
    const res = await fetch(productsApiUrl(`${apiFlag}=1`), { cache: "no-store" });
    if (!res.ok) return [];
    const data = await res.json();
    if (Array.isArray(data.products)) {
      return data.products.map(normalizeDbProduct);
    }
  } catch (e) {
    console.error(`Failed to fetch live products by flag ${flag}:`, e);
  }
  return [];
}

export async function fetchLiveProductBySlug(slug: string): Promise<Product | null> {
  try {
    const res = await fetch(productsApiUrl(`slug=${encodeURIComponent(slug)}`), { cache: "no-store" });
    if (res.ok) {
      const data = await res.json();
      if (data.product) return normalizeDbProduct(data.product);
    }
  } catch (e) {
    console.error(`Failed to fetch product by slug ${slug}:`, e);
  }
  return null;
}

export async function fetchSettings(): Promise<Record<string, string>> {
  try {
    const base = `${typeof window === "undefined"
      ? (process.env.BACKEND_API_URL || "https://api.onepoint.kz")
      : "https://api.onepoint.kz"}/api/settings.php`;
    const res = await fetch(base, { cache: "no-store" });
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
