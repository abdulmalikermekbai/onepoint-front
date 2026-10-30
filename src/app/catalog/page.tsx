"use client";
import { useState, useMemo, useEffect, useCallback } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import ProductCard from "@/components/ProductCard";
import { PRODUCTS, BRANDS, fetchLiveProducts, fetchSettings, fetchLiveBrands, fetchLiveCategories, Product } from "@/lib/data";
import { Suspense } from "react";

const CATEGORIES_FILTER = [
  { slug: "", label: "Все категории" },
  { slug: "gaming", label: "Игровые" },
  { slug: "office", label: "Для работы" },
  { slug: "student", label: "Для учёбы" },
  { slug: "ultrabook", label: "Ультрабуки" },
  { slug: "macbook", label: "MacBook" },
  { slug: "pro", label: "Профессиональные" },
  { slug: "designer", label: "Для дизайнеров" },
  { slug: "dev", label: "Для разработчиков" },
  { slug: "video", label: "Видеомонтаж" },
  { slug: "rtx", label: "С RTX" },
  { slug: "oled", label: "OLED" },
  { slug: "business", label: "Для бизнеса" },
  { slug: "accessories", label: "Аксессуары" },
];

function extractGpu(p: Product): string | null {
  const g = ((p.gpu || "") + " " + (p.cardGpu || "") + " " + (p.name || "")).replace(/[™®]/g, "");
  const rtxMatch = g.match(/\b(RTX\s*\d{4}(?:\s*Ti)?)\b/i);
  if (rtxMatch) {
    let raw = rtxMatch[1].toUpperCase().replace(/\s+/g, " ");
    if (raw.endsWith(" TI")) raw = raw.replace(" TI", " Ti");
    return raw;
  }
  const gtxMatch = g.match(/\b(GTX\s*\d{4}(?:\s*Ti)?)\b/i);
  if (gtxMatch) return gtxMatch[1].toUpperCase();
  if (/\b(?:Apple|M[1-9])\b/i.test(g)) return "Apple GPU";
  if (/\bArc\b/i.test(g)) return "Intel Arc";
  if (/\b(?:Iris|UHD Graphics|Intel Graphics)\b/i.test(g)) return "Intel Graphics";
  if (/\b(?:Radeon|AMD Graphics)\b/i.test(g)) return "AMD Radeon";
  if (/\bAdreno\b/i.test(g)) return "Qualcomm Adreno";
  return null;
}

function extractProcessor(p: Product): string | null {
  const pr = ((p.processor || "") + " " + (p.cardProcessor || "") + " " + (p.name || "")).replace(/[™®]/g, "");
  if (/Ultra\s*9/i.test(pr)) return "Intel Core Ultra 9";
  if (/Ultra\s*7/i.test(pr)) return "Intel Core Ultra 7";
  if (/Ultra\s*5/i.test(pr)) return "Intel Core Ultra 5";
  if (/Ultra\s*3/i.test(pr)) return "Intel Core Ultra 3";
  if (/Core\s*7\b/i.test(pr) && !/i7|Ultra/i.test(pr)) return "Intel Core 7";
  if (/Core\s*5\b/i.test(pr) && !/i5|Ultra/i.test(pr)) return "Intel Core 5";
  if (/Core\s*3\b/i.test(pr) && !/i3|Ultra/i.test(pr)) return "Intel Core 3";
  if (/Core\s*i9|\bi9\b/i.test(pr)) return "Intel Core i9";
  if (/Core\s*i7|\bi7\b/i.test(pr)) return "Intel Core i7";
  if (/Core\s*i5|\bi5\b/i.test(pr)) return "Intel Core i5";
  if (/Core\s*i3|\bi3\b/i.test(pr)) return "Intel Core i3";
  if (/Ryzen\s*AI/i.test(pr)) return "AMD Ryzen AI";
  if (/Ryzen\s*9/i.test(pr)) return "AMD Ryzen 9";
  if (/Ryzen\s*7/i.test(pr)) return "AMD Ryzen 7";
  if (/Ryzen\s*5/i.test(pr)) return "AMD Ryzen 5";
  if (/Ryzen\s*3/i.test(pr)) return "AMD Ryzen 3";
  if (/Apple\s*M|M[1-9]\b/i.test(pr)) return "Apple M";
  if (/Snapdragon/i.test(pr)) return "Qualcomm Snapdragon";
  return null;
}

function extractRam(p: Product): string | null {
  const raw = ((p.ram || "") + " " + (p.cardRam || "") + " " + (p.name || "")).replace(/[™®]/g, "");
  // Strip slot breakdowns like (2x8GB) or 2 × 8 ГБ so individual stick sizes don't get misidentified as total RAM
  const clean = raw.replace(/\b\d+\s*[xх×]\s*\d+\s*(?:gb|гб)?/gi, "");
  const m = clean.match(/\b(8|12|16|24|32|48|64|96|128)\s*(?:GB|ГБ)(?![a-zA-Zа-яА-Я0-9])/i);
  return m ? m[1] + " ГБ" : null;
}

function extractDisplay(p: Product): string | null {
  const text = (p.display || "") + " " + (p.name || "");
  const clean = text.replace(/″|дюйм(а|ов)?/g, '"');
  const m = clean.match(/\b(1[1-8](?:[\.,]\d)?)\s*"/);
  if (m) {
    const val = m[1].replace(",", ".");
    return val + '"';
  }
  return null;
}

function extractHz(p: Product): string | null {
  const text = (p.refreshRate || "") + " " + (p.name || "");
  const m = text.match(/\b(60|75|90|120|144|165|180|240|300|360|480|500)\s*(?:Hz|Гц)(?![a-zA-Zа-яА-Я0-9])/i);
  return m ? m[1] + " Гц" : null;
}

function extractMatrix(p: Product): string | null {
  const text = (p.matrixType || "") + " " + (p.name || "");
  if (/oled|amoled/i.test(text)) return "OLED";
  if (/mini[- ]?led/i.test(text)) return "Mini-LED";
  if (/ips|liquid retina|wva/i.test(text)) return "IPS";
  if (/\bva\b/i.test(text)) return "VA";
  if (/\btn\b/i.test(text)) return "TN";
  return null;
}

function sortGpus(a: string, b: string): number {
  const numA = parseInt(a.replace(/\D/g, ""), 10) || 0;
  const numB = parseInt(b.replace(/\D/g, ""), 10) || 0;
  if (numA && numB && numA !== numB) return numB - numA;
  if (numA && numB && numA === numB) {
    if (a.includes("Ti") && !b.includes("Ti")) return -1;
    if (!a.includes("Ti") && b.includes("Ti")) return 1;
  }
  if (numA && !numB) return -1;
  if (!numA && numB) return 1;
  return a.localeCompare(b, "ru");
}

function sortProcessors(a: string, b: string): number {
  const getRank = (name: string) => {
    if (name.includes("Ultra 9")) return 1;
    if (name.includes("Ultra 7")) return 2;
    if (name.includes("Ultra 5")) return 3;
    if (name.includes("Ultra 3")) return 4;
    if (name.includes("Core 7")) return 5;
    if (name.includes("Core 5")) return 6;
    if (name.includes("Core 3")) return 7;
    if (name.includes("Core i9")) return 8;
    if (name.includes("Core i7")) return 9;
    if (name.includes("Core i5")) return 10;
    if (name.includes("Core i3")) return 11;
    if (name.includes("Ryzen AI")) return 12;
    if (name.includes("Ryzen 9")) return 13;
    if (name.includes("Ryzen 7")) return 14;
    if (name.includes("Ryzen 5")) return 15;
    if (name.includes("Ryzen 3")) return 16;
    if (name.includes("Apple")) return 17;
    if (name.includes("Snapdragon")) return 18;
    return 99;
  };
  const ra = getRank(a);
  const rb = getRank(b);
  if (ra !== rb) return ra - rb;
  return a.localeCompare(b, "ru");
}

function sortRAMs(a: string, b: string): number {
  return (parseInt(a, 10) || 0) - (parseInt(b, 10) || 0);
}

function sortDisplays(a: string, b: string): number {
  return (parseFloat(a) || 0) - (parseFloat(b) || 0);
}

function sortHz(a: string, b: string): number {
  return (parseInt(a, 10) || 0) - (parseInt(b, 10) || 0);
}

function sortMatrix(a: string, b: string): number {
  const order = ["IPS", "OLED", "Mini-LED", "VA", "TN"];
  const ia = order.indexOf(a);
  const ib = order.indexOf(b);
  if (ia !== -1 && ib !== -1) return ia - ib;
  if (ia !== -1) return -1;
  if (ib !== -1) return 1;
  return a.localeCompare(b, "ru");
}

function matchCategory(p: Product, catSlug: string): boolean {
  if (!catSlug) return true;
  const slug = String(catSlug).trim().toLowerCase();

  const pCategories: string[] = Array.isArray(p.categories)
    ? p.categories
        .map(c => (typeof c === "string" ? c.trim().toLowerCase() : c && typeof c === "object" && (c as any).slug ? String((c as any).slug).trim().toLowerCase() : ""))
        .filter(Boolean)
    : [];
  const catSlugNorm = (p.categorySlug || "").toLowerCase();
  const catNameNorm = (p.categoryName || "").toLowerCase();
  const brandNorm = (p.brand || "").toLowerCase();
  const gpuNorm = (p.gpu || "").toLowerCase();
  const cardGpuNorm = (p.cardGpu || "").toLowerCase();
  const displayNorm = (p.display || "").toLowerCase();
  const matrixNorm = (p.matrixType || "").toLowerCase();
  const nameNorm = (p.name || "").toLowerCase();

  if (slug === "accessories") {
    return (
      catSlugNorm === "accessories" ||
      pCategories.includes("accessories") ||
      catNameNorm.includes("аксессуар") ||
      nameNorm.includes("мышь") ||
      nameNorm.includes("рюкзак") ||
      nameNorm.includes("чехол")
    );
  }
  if (slug === "rtx") {
    return (
      catSlugNorm === "rtx" ||
      pCategories.includes("rtx") ||
      gpuNorm.includes("rtx") ||
      cardGpuNorm.includes("rtx") ||
      nameNorm.includes("rtx")
    );
  }
  if (slug === "oled") {
    return (
      catSlugNorm === "oled" ||
      pCategories.includes("oled") ||
      matrixNorm.includes("oled") ||
      matrixNorm.includes("amoled") ||
      displayNorm.includes("oled") ||
      nameNorm.includes("oled")
    );
  }
  if (slug === "macbook") {
    return (
      brandNorm === "apple" ||
      catSlugNorm === "macbook" ||
      pCategories.includes("macbook") ||
      nameNorm.includes("macbook")
    );
  }
  if (slug === "gaming") {
    return (
      catSlugNorm === "gaming" ||
      pCategories.includes("gaming")
    );
  }
  if (slug === "ultrabook") {
    // A gaming laptop is not an ultrabook unless explicitly tagged with ultrabook category
    if (catSlugNorm === "gaming" && !pCategories.includes("ultrabook")) {
      return false;
    }
    return (
      catSlugNorm === "ultrabook" ||
      pCategories.includes("ultrabook") ||
      catNameNorm.includes("ультрабук")
    );
  }

  return (
    catSlugNorm === slug ||
    pCategories.includes(slug) ||
    catNameNorm === slug ||
    catNameNorm.includes(slug)
  );
}

function matchGPU(p: Product, selectedGPU: string): boolean {
  const extracted = extractGpu(p);
  if (extracted) {
    return extracted.toLowerCase() === selectedGPU.toLowerCase();
  }

  const g = ((p.gpu || "") + " " + (p.cardGpu || "") + " " + (p.name || "")).toLowerCase();
  const k = selectedGPU.toLowerCase();

  if (k === "rtx 5070") {
    return (g.includes("rtx 5070") || g.includes("rtx5070")) && !g.includes("5070 ti") && !g.includes("5070ti");
  }
  if (k === "rtx 5070 ti") {
    return g.includes("5070 ti") || g.includes("5070ti");
  }
  if (k === "rtx 5050") {
    return g.includes("rtx 5050") || g.includes("rtx5050") || g.includes("5050 8gb") || g.includes("5050");
  }
  if (k === "rtx 5060") {
    return g.includes("rtx 5060") || g.includes("rtx5060");
  }
  if (k === "rtx 5080") {
    return g.includes("rtx 5080") || g.includes("rtx5080");
  }
  if (k === "rtx 5090") {
    return g.includes("rtx 5090") || g.includes("rtx5090");
  }
  if (k === "rtx 4050") {
    return g.includes("rtx 4050") || g.includes("rtx4050");
  }
  if (k === "rtx 4060") {
    return g.includes("rtx 4060") || g.includes("rtx4060");
  }
  if (k === "rtx 3050") {
    return g.includes("rtx 3050") || g.includes("rtx3050");
  }
  if (k === "apple gpu") {
    return g.includes("apple") || g.includes("m5") || g.includes("m4") || g.includes("m3") || g.includes("m2") || g.includes("m1");
  }
  if (k === "intel arc") {
    return g.includes("arc");
  }
  if (k === "intel graphics") {
    return (g.includes("intel graphics") || g.includes("iris xe") || g.includes("intel uhd")) && !g.includes("arc");
  }
  if (k === "amd radeon") {
    return g.includes("radeon");
  }
  return g.includes(k);
}

function matchProcessor(p: Product, selectedProc: string): boolean {
  const extracted = extractProcessor(p);
  if (extracted) {
    return extracted.toLowerCase() === selectedProc.toLowerCase();
  }

  const pr = ((p.processor || "") + " " + (p.cardProcessor || "") + " " + (p.name || "")).toLowerCase();
  const k = selectedProc.toLowerCase();

  if (k === "intel core ultra 9") return pr.includes("ultra 9");
  if (k === "intel core ultra 7") return pr.includes("ultra 7");
  if (k === "intel core ultra 5") return pr.includes("ultra 5");
  if (k === "intel core ultra 3") return pr.includes("ultra 3");
  if (k === "intel core 7") return (pr.includes("core 7") || pr.includes("core™ 7")) && !pr.includes("ultra") && !pr.includes("i7");
  if (k === "intel core 5") return (pr.includes("core 5") || pr.includes("core™ 5")) && !pr.includes("ultra") && !pr.includes("i5");
  if (k === "intel core 3") return (pr.includes("core 3") || pr.includes("core™ 3")) && !pr.includes("ultra") && !pr.includes("i3");
  if (k === "intel core i9") return pr.includes("i9") || pr.includes("core i9");
  if (k === "intel core i7") return pr.includes("i7") || pr.includes("core i7");
  if (k === "intel core i5") return pr.includes("i5") || pr.includes("core i5");
  if (k === "intel core i3") return pr.includes("i3") || pr.includes("core i3");
  if (k === "amd ryzen ai") return pr.includes("ryzen ai");
  if (k === "amd ryzen 9") return pr.includes("ryzen 9") || pr.includes("ryzen™ 9");
  if (k === "amd ryzen 7") return (pr.includes("ryzen 7") || pr.includes("ryzen™ 7")) && !pr.includes("ryzen ai");
  if (k === "amd ryzen 5") return (pr.includes("ryzen 5") || pr.includes("ryzen™ 5")) && !pr.includes("ryzen ai");
  if (k === "amd ryzen 3") return (pr.includes("ryzen 3") || pr.includes("ryzen™ 3")) && !pr.includes("ryzen ai");
  if (k === "apple m") return pr.includes("apple m") || pr.includes("m5") || pr.includes("m4") || pr.includes("m3") || pr.includes("m2") || pr.includes("m1");
  if (k === "qualcomm snapdragon") return pr.includes("snapdragon");
  return pr.includes(k);
}

function matchDisplay(p: Product, d: string): boolean {
  const extracted = extractDisplay(p);
  if (extracted) {
    return extracted === d;
  }
  const text = ((p.display || "") + " " + (p.name || "")).replace(/″|дюйм(а|ов)?/g, '"');
  const dNum = d.replace('"', "").trim();
  if (dNum === "13.6") return text.includes("13.6") || text.includes("13.3") || text.includes("13\"");
  if (dNum === "14") return text.includes("14\"") || text.includes("14 ");
  if (dNum === "15.3") return text.includes("15.3");
  if (dNum === "15.6") return text.includes("15.6") || text.includes("15,6");
  if (dNum === "16") return (text.includes("16\"") || text.includes("16 ")) && !text.includes("160") && !text.includes("165");
  if (dNum === "17.3") return text.includes("17.3") || text.includes("17,3") || text.includes("17\"");
  if (dNum === "18") return (text.includes("18\"") || text.includes("18 ")) && !text.includes("180");
  return false;
}

function matchRAM(p: Product, r: string): boolean {
  const extracted = extractRam(p);
  if (extracted) {
    return extracted === r;
  }
  const text = ((p.ram || "") + " " + (p.cardRam || "")).toLowerCase().replace(/\b\d+\s*[xх×]\s*\d+\s*(?:gb|гб)?/gi, "");
  const num = r.split(" ")[0];
  const m = text.match(/\b(\d+)\s*(?:gb|гб)(?![a-zA-Zа-яА-Я0-9])/i);
  return m ? m[1] === num : false;
}

function matchHz(p: Product, hz: string): boolean {
  const extracted = extractHz(p);
  if (extracted) {
    return extracted === hz;
  }
  const text = ((p.refreshRate || "") + " " + (p.name || "")).toLowerCase();
  const num = hz.split(" ")[0];
  const m = text.match(/\b(\d+)\s*(?:hz|гц)(?![a-zA-Zа-яА-Я0-9])/i);
  return m ? m[1] === num : false;
}

function matchMatrix(p: Product, m: string): boolean {
  const extracted = extractMatrix(p);
  if (extracted) {
    return extracted === m;
  }
  const text = ((p.matrixType || "") + " " + (p.name || "")).toLowerCase();
  if (m === "OLED") return text.includes("oled") || text.includes("amoled");
  if (m === "Mini-LED") return text.includes("mini led") || text.includes("mini-led");
  if (m === "IPS") return text.includes("ips") || text.includes("wva");
  return false;
}

function normalizeCategoryInput(raw: string): string {
  if (!raw) return "";
  const cleaned = raw.trim().toLowerCase();
  const found = CATEGORIES_FILTER.find(
    c => c.slug.toLowerCase() === cleaned || c.label.toLowerCase() === cleaned
  );
  if (found) return found.slug;
  if (cleaned === "programmer" || cleaned === "programming") return "dev";
  return raw.trim();
}

function normalizeBrandInput(raw: string, brandList: { name: string; slug: string }[]): string {
  if (!raw) return "";
  const cleaned = raw.trim().toLowerCase();
  const found = brandList.find(
    b => b.slug.toLowerCase() === cleaned || b.name.toLowerCase() === cleaned
  );
  if (found) return found.name;
  return raw.trim();
}

function scrollToProductsTop() {
  if (typeof window !== "undefined") {
    const el = document.getElementById("catalog-content");
    if (el) {
      const rect = el.getBoundingClientRect();
      const scrollTop = window.pageYOffset || document.documentElement.scrollTop;
      const targetY = rect.top + scrollTop - 80;
      if (scrollTop > targetY + 60) {
        window.scrollTo({ top: Math.max(0, targetY), behavior: "smooth" });
      }
    }
  }
}

function CatalogFilters() {
  const router = useRouter();
  const searchParams = useSearchParams();

  // 1. Live Data initialized from session cache to eliminate loading flash
  const [productsList, setProductsList] = useState<Product[]>(() => {
    if (typeof window !== "undefined") {
      try {
        const saved = sessionStorage.getItem("op_live_products");
        if (saved) {
          const parsed = JSON.parse(saved);
          if (Array.isArray(parsed) && parsed.length > 0) return parsed;
        }
      } catch (_) {}
    }
    return PRODUCTS;
  });
  const [isLoading, setIsLoading] = useState<boolean>(() => productsList.length === 0);
  const [liveBrands, setLiveBrands] = useState<{ name: string; slug: string }[]>(BRANDS);
  const [liveCategories, setLiveCategories] = useState<{ id: string; name: string; slug: string }[]>([]);

  useEffect(() => {
    if (productsList.length === 0) setIsLoading(true);
    Promise.all([fetchLiveProducts(), fetchLiveBrands(), fetchLiveCategories()])
      .then(([list, brands, cats]) => {
        if (list && list.length > 0) setProductsList(list);
        if (brands && brands.length > 0) setLiveBrands(brands);
        if (cats && cats.length > 0) setLiveCategories(cats);
        setIsLoading(false);
      })
      .catch(() => {
        setIsLoading(false);
      });
  }, [productsList.length]);

  // 2. Active filters derived directly from searchParams (Single Source of Truth)
  const rawCat = searchParams.get("cat") || searchParams.get("category") || "";
  const category = normalizeCategoryInput(rawCat);

  const rawBrand = searchParams.get("brand") || "";
  const brand = useMemo(() => normalizeBrandInput(rawBrand, liveBrands), [rawBrand, liveBrands]);

  const searchQuery = searchParams.get("q") || searchParams.get("search") || searchParams.get("query") || "";
  const priceMin = searchParams.get("price_min") || searchParams.get("min_price") || searchParams.get("priceMin") || "";
  const priceMax = searchParams.get("price_max") || searchParams.get("max_price") || searchParams.get("priceMax") || "";

  const procsParam = searchParams.get("proc") || searchParams.get("processor") || "";
  const selectedProcs = useMemo(() => procsParam ? procsParam.split(",").filter(Boolean) : [], [procsParam]);

  const gpusParam = searchParams.get("gpu") || "";
  const selectedGPUs = useMemo(() => gpusParam ? gpusParam.split(",").filter(Boolean) : [], [gpusParam]);

  const ramsParam = searchParams.get("ram") || "";
  const selectedRAMs = useMemo(() => ramsParam ? ramsParam.split(",").filter(Boolean) : [], [ramsParam]);

  const displaysParam = searchParams.get("display") || "";
  const selectedDisplays = useMemo(() => displaysParam ? displaysParam.split(",").filter(Boolean) : [], [displaysParam]);

  const hzParam = searchParams.get("hz") || "";
  const selectedHz = useMemo(() => hzParam ? hzParam.split(",").filter(Boolean) : [], [hzParam]);

  const matrixParam = searchParams.get("matrix") || "";
  const selectedMatrix = useMemo(() => matrixParam ? matrixParam.split(",").filter(Boolean) : [], [matrixParam]);

  const inStockOnly = searchParams.get("in_stock") === "1" || searchParams.get("instock") === "1" || searchParams.get("in_stock") === "true";
  const saleOnly = searchParams.get("sale") === "1" || searchParams.get("is_sale") === "1" || searchParams.get("sale") === "true";
  const newOnly = searchParams.get("new") === "1" || searchParams.get("is_new") === "1" || searchParams.get("new") === "true";
  const sortBy = searchParams.get("sort") || searchParams.get("sort_by") || searchParams.get("sortBy") || "popular";

  // 3. Local UI state for price input typing & mobile drawer
  const [priceMinInput, setPriceMinInput] = useState(priceMin);
  const [priceMaxInput, setPriceMaxInput] = useState(priceMax);
  const [searchInput, setSearchInput] = useState(searchQuery);
  const [filterOpen, setFilterOpen] = useState(false);

  useEffect(() => {
    setPriceMinInput(priceMin);
  }, [priceMin]);

  useEffect(() => {
    setPriceMaxInput(priceMax);
  }, [priceMax]);

  useEffect(() => {
    setSearchInput(searchQuery);
  }, [searchQuery]);

  // 4. Update URL params seamlessly & scroll to products
  const updateFilters = useCallback((updates: Record<string, string | string[] | boolean | undefined | null>) => {
    const params = new URLSearchParams(searchParams.toString());

    // Clean any alias legacy keys
    params.delete("category");
    params.delete("search");
    params.delete("query");
    params.delete("min_price");
    params.delete("priceMin");
    params.delete("max_price");
    params.delete("priceMax");
    params.delete("processor");
    params.delete("instock");
    params.delete("is_sale");
    params.delete("is_new");
    params.delete("sort_by");
    params.delete("sortBy");

    Object.entries(updates).forEach(([key, val]) => {
      if (val === undefined || val === null || val === "" || val === false) {
        params.delete(key);
      } else if (Array.isArray(val)) {
        if (val.length === 0) {
          params.delete(key);
        } else {
          params.set(key, val.join(","));
        }
      } else if (typeof val === "boolean") {
        if (val) params.set(key, "1");
        else params.delete(key);
      } else {
        params.set(key, String(val).trim());
      }
    });

    const qs = params.toString();
    const newUrl = qs ? `/catalog?${qs}` : `/catalog`;
    router.replace(newUrl, { scroll: false });
    scrollToProductsTop();
  }, [router, searchParams]);

  const toggleCheckbox = (key: string, arr: string[], val: string) => {
    const next = arr.includes(val) ? arr.filter(v => v !== val) : [...arr, val];
    updateFilters({ [key]: next });
  };

  const applyPriceFilter = () => {
    updateFilters({
      price_min: priceMinInput.trim(),
      price_max: priceMaxInput.trim(),
    });
  };

  const resetFilters = () => {
    setPriceMinInput("");
    setPriceMaxInput("");
    setSearchInput("");
    router.replace("/catalog", { scroll: false });
    scrollToProductsTop();
  };

  // 5. Dynamic filter options derived automatically and synchronously from live products
  const availableCategories = useMemo(() => {
    const list = [...CATEGORIES_FILTER];
    liveCategories.forEach(lc => {
      if (lc.slug && !list.some(c => c.slug.toLowerCase() === lc.slug.toLowerCase())) {
        list.push({ slug: lc.slug, label: lc.name || lc.slug });
      }
    });
    return list;
  }, [liveCategories]);

  const availableBrands = useMemo(() => {
    const brandSet = new Set<string>();
    liveBrands.forEach(b => {
      if (b.name && b.name.trim()) brandSet.add(b.name.trim());
    });
    productsList.forEach(p => {
      if (p.brand && p.brand.trim() && p.brand !== "OnePoint" && p.brand !== "Ноутбуки") {
        brandSet.add(p.brand.trim());
      }
    });
    return ["", ...Array.from(brandSet).sort((a, b) => a.localeCompare(b, "ru"))];
  }, [productsList, liveBrands]);

  const availableGPUs = useMemo(() => {
    const set = new Set<string>();
    productsList.forEach(p => {
      const g = extractGpu(p);
      if (g) set.add(g);
    });
    return Array.from(set).sort(sortGpus);
  }, [productsList]);

  const availableProcessors = useMemo(() => {
    const set = new Set<string>();
    productsList.forEach(p => {
      const pr = extractProcessor(p);
      if (pr) set.add(pr);
    });
    return Array.from(set).sort(sortProcessors);
  }, [productsList]);

  const availableRAMs = useMemo(() => {
    const set = new Set<string>();
    productsList.forEach(p => {
      const r = extractRam(p);
      if (r) set.add(r);
    });
    return Array.from(set).sort(sortRAMs);
  }, [productsList]);

  const availableDisplays = useMemo(() => {
    const set = new Set<string>();
    productsList.forEach(p => {
      const d = extractDisplay(p);
      if (d) set.add(d);
    });
    return Array.from(set).sort(sortDisplays);
  }, [productsList]);

  const availableHz = useMemo(() => {
    const set = new Set<string>();
    productsList.forEach(p => {
      const h = extractHz(p);
      if (h) set.add(h);
    });
    return Array.from(set).sort(sortHz);
  }, [productsList]);

  const availableMatrix = useMemo(() => {
    const set = new Set<string>();
    productsList.forEach(p => {
      const m = extractMatrix(p);
      if (m) set.add(m);
    });
    return Array.from(set).sort(sortMatrix);
  }, [productsList]);

  // Counts calculated dynamically for all options
  const categoryCounts = useMemo(() => {
    const counts: Record<string, number> = {};
    availableCategories.forEach(cat => {
      if (!cat.slug) {
        counts[""] = productsList.length;
      } else {
        counts[cat.slug] = productsList.filter(p => matchCategory(p, cat.slug)).length;
      }
    });
    return counts;
  }, [productsList, availableCategories]);

  const brandCounts = useMemo(() => {
    const counts: Record<string, number> = {};
    availableBrands.forEach(b => {
      if (!b) {
        counts[""] = productsList.length;
      } else {
        const bTarget = b.toLowerCase();
        counts[b] = productsList.filter(
          p => (p.brand || "").toLowerCase() === bTarget
        ).length;
      }
    });
    return counts;
  }, [productsList, availableBrands]);

  const gpuCounts = useMemo(() => {
    const counts: Record<string, number> = {};
    availableGPUs.forEach(g => {
      counts[g] = productsList.filter(p => matchGPU(p, g)).length;
    });
    return counts;
  }, [productsList, availableGPUs]);

  const procCounts = useMemo(() => {
    const counts: Record<string, number> = {};
    availableProcessors.forEach(pr => {
      counts[pr] = productsList.filter(p => matchProcessor(p, pr)).length;
    });
    return counts;
  }, [productsList, availableProcessors]);

  const ramCounts = useMemo(() => {
    const counts: Record<string, number> = {};
    availableRAMs.forEach(r => {
      counts[r] = productsList.filter(p => matchRAM(p, r)).length;
    });
    return counts;
  }, [productsList, availableRAMs]);

  const displayCounts = useMemo(() => {
    const counts: Record<string, number> = {};
    availableDisplays.forEach(d => {
      counts[d] = productsList.filter(p => matchDisplay(p, d)).length;
    });
    return counts;
  }, [productsList, availableDisplays]);

  const hzCounts = useMemo(() => {
    const counts: Record<string, number> = {};
    availableHz.forEach(h => {
      counts[h] = productsList.filter(p => matchHz(p, h)).length;
    });
    return counts;
  }, [productsList, availableHz]);

  const matrixCounts = useMemo(() => {
    const counts: Record<string, number> = {};
    availableMatrix.forEach(m => {
      counts[m] = productsList.filter(p => matchMatrix(p, m)).length;
    });
    return counts;
  }, [productsList, availableMatrix]);

  // 13. Filtered & Sorted Products
  const filtered = useMemo(() => {
    let result = [...productsList];

    const currentSearch = (searchInput.trim() || searchQuery.trim()).toLowerCase();
    if (currentSearch) {
      result = result.filter(p =>
        (p.name || "").toLowerCase().includes(currentSearch) ||
        (p.brand || "").toLowerCase().includes(currentSearch) ||
        (p.model || "").toLowerCase().includes(currentSearch) ||
        (p.series || "").toLowerCase().includes(currentSearch) ||
        (p.sku || "").toLowerCase().includes(currentSearch) ||
        (p.processor || "").toLowerCase().includes(currentSearch) ||
        (p.gpu || "").toLowerCase().includes(currentSearch) ||
        (p.categoryName || "").toLowerCase().includes(currentSearch) ||
        (p.cardProcessor || "").toLowerCase().includes(currentSearch) ||
        (p.cardGpu || "").toLowerCase().includes(currentSearch)
      );
    }

    if (category) {
      result = result.filter(p => matchCategory(p, category));
    }

    if (brand) {
      const bTarget = brand.toLowerCase();
      result = result.filter(p => (p.brand || "").toLowerCase() === bTarget);
    }

    if (priceMin) {
      const minVal = parseInt(priceMin, 10);
      if (!isNaN(minVal)) result = result.filter(p => p.price >= minVal);
    }

    if (priceMax) {
      const maxVal = parseInt(priceMax, 10);
      if (!isNaN(maxVal)) result = result.filter(p => p.price <= maxVal);
    }

    if (selectedProcs.length) {
      result = result.filter(p =>
        selectedProcs.some(proc => matchProcessor(p, proc))
      );
    }

    if (selectedGPUs.length) {
      result = result.filter(p =>
        selectedGPUs.some(g => matchGPU(p, g))
      );
    }

    if (selectedRAMs.length) {
      result = result.filter(p =>
        selectedRAMs.some(r => matchRAM(p, r))
      );
    }

    if (selectedDisplays.length) {
      result = result.filter(p =>
        selectedDisplays.some(d => matchDisplay(p, d))
      );
    }

    if (selectedHz.length) {
      result = result.filter(p =>
        selectedHz.some(hz => matchHz(p, hz))
      );
    }

    if (selectedMatrix.length) {
      result = result.filter(p =>
        selectedMatrix.some(m => matchMatrix(p, m))
      );
    }

    if (inStockOnly) result = result.filter(p => p.inStock);
    if (saleOnly) result = result.filter(p => p.isSale);
    if (newOnly) result = result.filter(p => p.isNew);

    switch (sortBy) {
      case "price_asc":
        result.sort((a, b) => a.price - b.price);
        break;
      case "price_desc":
        result.sort((a, b) => b.price - a.price);
        break;
      case "rating":
        result.sort((a, b) => b.rating - a.rating);
        break;
      case "new":
        result.sort((a, b) => (b.isNew ? 1 : 0) - (a.isNew ? 1 : 0));
        break;
      default:
        result.sort((a, b) => {
          const sa = a.sortOrder ?? 0;
          const sb = b.sortOrder ?? 0;
          if (sa !== sb) return sa - sb;
          return (b.isHit ? 1 : 0) - (a.isHit ? 1 : 0);
        });
    }

    return result;
  }, [
    productsList,
    searchInput,
    searchQuery,
    category,
    brand,
    priceMin,
    priceMax,
    selectedProcs,
    selectedGPUs,
    selectedRAMs,
    selectedDisplays,
    selectedHz,
    selectedMatrix,
    inStockOnly,
    saleOnly,
    newOnly,
    sortBy,
  ]);

  const activeCategoryLabel = useMemo(() => {
    if (!category) return "";
    const found = availableCategories.find(
      c => c.slug.toLowerCase() === category.toLowerCase()
    );
    return found ? found.label : category;
  }, [category, availableCategories]);

  const hasActiveFilters = Boolean(
    category ||
    brand ||
    searchQuery.trim() ||
    searchInput.trim() ||
    priceMin ||
    priceMax ||
    selectedProcs.length ||
    selectedGPUs.length ||
    selectedRAMs.length ||
    selectedDisplays.length ||
    selectedHz.length ||
    selectedMatrix.length ||
    inStockOnly ||
    saleOnly ||
    newOnly ||
    sortBy !== "popular"
  );

  return (
    <div id="catalog-content">
      {/* Quick Search on Catalog */}
      <div
        style={{
          display: "flex",
          alignItems: "center",
          gap: 12,
          marginBottom: 24,
          background: "var(--surface)",
          padding: "10px 16px",
          borderRadius: 16,
          border: "1.5px solid var(--border)",
        }}
      >
        <svg
          viewBox="0 0 24 24"
          fill="none"
          stroke="var(--text-muted)"
          strokeWidth="2"
          width="20"
          height="20"
        >
          <circle cx="11" cy="11" r="8" />
          <line x1="21" y1="21" x2="16.65" y2="16.65" />
        </svg>
        <input
          type="text"
          placeholder="Быстрый поиск в каталоге (по названию, видеокарте, процессору)..."
          value={searchInput}
          onChange={e => {
            const val = e.target.value;
            setSearchInput(val);
          }}
          onKeyDown={e => {
            if (e.key === "Enter") {
              updateFilters({ q: searchInput });
            }
          }}
          onBlur={() => {
            if (searchInput !== searchQuery) {
              updateFilters({ q: searchInput });
            }
          }}
          style={{
            flex: 1,
            border: "none",
            background: "transparent",
            outline: "none",
            fontSize: 15,
            fontFamily: "inherit",
            color: "var(--text)",
          }}
        />
        {searchInput && (
          <button
            onClick={() => {
              setSearchInput("");
              updateFilters({ q: "" });
            }}
            style={{
              background: "none",
              border: "none",
              fontSize: 18,
              cursor: "pointer",
              color: "var(--text-muted)",
              padding: "4px 8px",
            }}
            title="Очистить поиск"
          >
            ✕
          </button>
        )}
      </div>

      {/* Mobile Filter Toggle Button */}
      <div style={{ display: "none" }} className="mobile-filter-bar">
        <button
          className="btn btn-primary"
          style={{
            width: "100%",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            gap: 10,
            padding: "14px",
            borderRadius: 12,
            marginBottom: 20,
          }}
          onClick={() => setFilterOpen(true)}
        >
          <svg
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            width="20"
            height="20"
          >
            <polygon points="22 3 2 3 10 12.46 10 19 14 21 14 12.46 22 3" />
          </svg>
          Фильтры {hasActiveFilters ? "• Активны" : ""}
        </button>
      </div>

      {/* Mobile Filter Drawer Overlay */}
      {filterOpen && (
        <div
          className="filter-drawer-overlay"
          onClick={() => setFilterOpen(false)}
          style={{
            position: "fixed",
            inset: 0,
            zIndex: 9998,
            background: "rgba(0,0,0,0.6)",
            backdropFilter: "blur(4px)",
          }}
        />
      )}

      <div style={{ display: "flex", gap: 28, alignItems: "flex-start" }}>
        {/* Sidebar */}
        <aside
          className={`filter-sidebar${filterOpen ? " mobile-open" : ""}`}
          style={{
            position: filterOpen ? "fixed" : "sticky",
            top: filterOpen ? 0 : 88,
            left: filterOpen ? 0 : undefined,
            bottom: filterOpen ? 0 : undefined,
            zIndex: filterOpen ? 9999 : 20,
            width: filterOpen ? "320px" : undefined,
            maxWidth: filterOpen ? "85vw" : undefined,
            background: filterOpen ? "#fff" : undefined,
            maxHeight: filterOpen ? "100vh" : "calc(100vh - 104px)",
            overflowY: "auto",
            overscrollBehavior: "contain",
            paddingBottom: filterOpen ? "90px" : "32px",
            padding: filterOpen ? "24px 24px 90px" : undefined,
            boxShadow: filterOpen ? "4px 0 24px rgba(0,0,0,0.15)" : undefined,
          }}
        >
          <div
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              marginBottom: 16,
            }}
          >
            <span style={{ fontWeight: 800, fontSize: 18 }}>Фильтры</span>
            <div style={{ display: "flex", gap: 12, alignItems: "center" }}>
              <button
                onClick={resetFilters}
                style={{
                  fontSize: 13,
                  color: "var(--accent)",
                  fontWeight: 700,
                  background: "none",
                  border: "none",
                  cursor: "pointer",
                }}
              >
                Сбросить
              </button>
              {filterOpen && (
                <button
                  onClick={() => setFilterOpen(false)}
                  style={{
                    background: "none",
                    border: "none",
                    fontSize: 22,
                    cursor: "pointer",
                    color: "var(--text-muted)",
                  }}
                >
                  ✕
                </button>
              )}
            </div>
          </div>

          {/* Category */}
          <div className="filter-card">
            <div className="filter-title">Категория</div>
            {availableCategories.map(c => {
              const isSelected =
                (!category && !c.slug) ||
                (Boolean(category) && category.toLowerCase() === c.slug.toLowerCase());
              const count = categoryCounts[c.slug] ?? 0;

              return (
                <label
                  key={c.slug || "all"}
                  className="filter-option"
                  style={{
                    color: isSelected ? "var(--accent)" : undefined,
                    fontWeight: isSelected ? 700 : undefined,
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                    cursor: "pointer",
                  }}
                >
                  <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                    <input
                      type="radio"
                      name="cat"
                      checked={isSelected}
                      onChange={() => updateFilters({ cat: c.slug })}
                      style={{ accentColor: "var(--accent)" }}
                    />
                    <span>{c.label}</span>
                  </div>
                  {productsList.length > 0 && count > 0 && (
                    <span style={{ fontSize: 12, color: "var(--text-muted)", opacity: 0.8 }}>
                      {count}
                    </span>
                  )}
                </label>
              );
            })}
          </div>

          {/* Brand */}
          <div className="filter-card">
            <div className="filter-title">Бренд</div>
            {availableBrands.map(b => {
              const isSelected = !b ? !brand : brand.toLowerCase() === b.toLowerCase();
              const count = b ? (brandCounts[b] ?? 0) : productsList.length;

              return (
                <label
                  key={b || "all-brands"}
                  className="filter-option"
                  style={{
                    color: isSelected ? "var(--accent)" : undefined,
                    fontWeight: isSelected ? 700 : undefined,
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                    cursor: "pointer",
                  }}
                >
                  <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                    <input
                      type="radio"
                      name="brand"
                      checked={isSelected}
                      onChange={() => updateFilters({ brand: b })}
                      style={{ accentColor: "var(--accent)" }}
                    />
                    <span>{b || "Все бренды"}</span>
                  </div>
                  {productsList.length > 0 && count > 0 && (
                    <span style={{ fontSize: 12, color: "var(--text-muted)", opacity: 0.8 }}>
                      {count}
                    </span>
                  )}
                </label>
              );
            })}
          </div>

          {/* Price */}
          <div className="filter-card">
            <div className="filter-title">Цена (₸)</div>
            <div className="price-range" style={{ display: "flex", gap: 8, marginBottom: 8 }}>
              <input
                className="price-input"
                type="number"
                placeholder="от 100 000"
                value={priceMinInput}
                onChange={e => setPriceMinInput(e.target.value)}
                onKeyDown={e => {
                  if (e.key === "Enter") applyPriceFilter();
                }}
                onBlur={applyPriceFilter}
                style={{
                  width: "50%",
                  padding: "10px",
                  borderRadius: 8,
                  border: "1px solid var(--border)",
                  fontFamily: "inherit",
                }}
              />
              <input
                className="price-input"
                type="number"
                placeholder="до 2 500 000"
                value={priceMaxInput}
                onChange={e => setPriceMaxInput(e.target.value)}
                onKeyDown={e => {
                  if (e.key === "Enter") applyPriceFilter();
                }}
                onBlur={applyPriceFilter}
                style={{
                  width: "50%",
                  padding: "10px",
                  borderRadius: 8,
                  border: "1px solid var(--border)",
                  fontFamily: "inherit",
                }}
              />
            </div>
            {(priceMinInput !== priceMin || priceMaxInput !== priceMax) && (
              <button
                type="button"
                onClick={applyPriceFilter}
                style={{
                  width: "100%",
                  padding: "6px 12px",
                  borderRadius: 8,
                  background: "var(--accent)",
                  color: "#fff",
                  fontSize: 12.5,
                  fontWeight: 700,
                  cursor: "pointer",
                  marginTop: 4,
                  border: "none",
                }}
              >
                Применить цену
              </button>
            )}
          </div>

          {/* Processor */}
          <div className="filter-card">
            <div className="filter-title">Процессор</div>
            {availableProcessors.filter(p => (procCounts[p] ?? 0) > 0 || selectedProcs.includes(p)).map(p => {
              const isSelected = selectedProcs.includes(p);
              const count = procCounts[p] ?? 0;
              return (
                <label
                  key={p}
                  className="filter-option"
                  style={{
                    color: isSelected ? "var(--accent)" : undefined,
                    fontWeight: isSelected ? 700 : undefined,
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                    cursor: "pointer",
                  }}
                >
                  <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                    <input
                      type="checkbox"
                      checked={isSelected}
                      onChange={() => toggleCheckbox("proc", selectedProcs, p)}
                      style={{ accentColor: "var(--accent)" }}
                    />
                    <span>{p}</span>
                  </div>
                  {productsList.length > 0 && count > 0 && (
                    <span style={{ fontSize: 12, color: "var(--text-muted)", opacity: 0.8 }}>
                      {count}
                    </span>
                  )}
                </label>
              );
            })}
          </div>

          {/* GPU */}
          <div className="filter-card">
            <div className="filter-title">Видеокарта</div>
            {availableGPUs.filter(g => (gpuCounts[g] ?? 0) > 0 || selectedGPUs.includes(g)).map(g => {
              const isSelected = selectedGPUs.includes(g);
              const count = gpuCounts[g] ?? 0;
              return (
                <label
                  key={g}
                  className="filter-option"
                  style={{
                    color: isSelected ? "var(--accent)" : undefined,
                    fontWeight: isSelected ? 700 : undefined,
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                    cursor: "pointer",
                  }}
                >
                  <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                    <input
                      type="checkbox"
                      checked={isSelected}
                      onChange={() => toggleCheckbox("gpu", selectedGPUs, g)}
                      style={{ accentColor: "var(--accent)" }}
                    />
                    <span>{g}</span>
                  </div>
                  {productsList.length > 0 && count > 0 && (
                    <span style={{ fontSize: 12, color: "var(--text-muted)", opacity: 0.8 }}>
                      {count}
                    </span>
                  )}
                </label>
              );
            })}
          </div>

          {/* RAM */}
          <div className="filter-card">
            <div className="filter-title">Оперативная память</div>
            {availableRAMs.filter(r => (ramCounts[r] ?? 0) > 0 || selectedRAMs.includes(r)).map(r => {
              const isSelected = selectedRAMs.includes(r);
              const count = ramCounts[r] ?? 0;
              return (
                <label
                  key={r}
                  className="filter-option"
                  style={{
                    color: isSelected ? "var(--accent)" : undefined,
                    fontWeight: isSelected ? 700 : undefined,
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                    cursor: "pointer",
                  }}
                >
                  <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                    <input
                      type="checkbox"
                      checked={isSelected}
                      onChange={() => toggleCheckbox("ram", selectedRAMs, r)}
                      style={{ accentColor: "var(--accent)" }}
                    />
                    <span>{r}</span>
                  </div>
                  {productsList.length > 0 && count > 0 && (
                    <span style={{ fontSize: 12, color: "var(--text-muted)", opacity: 0.8 }}>
                      {count}
                    </span>
                  )}
                </label>
              );
            })}
          </div>

          {/* Display */}
          <div className="filter-card">
            <div className="filter-title">Диагональ</div>
            {availableDisplays.filter(d => (displayCounts[d] ?? 0) > 0 || selectedDisplays.includes(d)).map(d => {
              const isSelected = selectedDisplays.includes(d);
              const count = displayCounts[d] ?? 0;
              return (
                <label
                  key={d}
                  className="filter-option"
                  style={{
                    color: isSelected ? "var(--accent)" : undefined,
                    fontWeight: isSelected ? 700 : undefined,
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                    cursor: "pointer",
                  }}
                >
                  <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                    <input
                      type="checkbox"
                      checked={isSelected}
                      onChange={() => toggleCheckbox("display", selectedDisplays, d)}
                      style={{ accentColor: "var(--accent)" }}
                    />
                    <span>{d}</span>
                  </div>
                  {productsList.length > 0 && count > 0 && (
                    <span style={{ fontSize: 12, color: "var(--text-muted)", opacity: 0.8 }}>
                      {count}
                    </span>
                  )}
                </label>
              );
            })}
          </div>

          {/* Hz */}
          <div className="filter-card">
            <div className="filter-title">Частота экрана</div>
            {availableHz.filter(hz => (hzCounts[hz] ?? 0) > 0 || selectedHz.includes(hz)).map(hz => {
              const isSelected = selectedHz.includes(hz);
              const count = hzCounts[hz] ?? 0;
              return (
                <label
                  key={hz}
                  className="filter-option"
                  style={{
                    color: isSelected ? "var(--accent)" : undefined,
                    fontWeight: isSelected ? 700 : undefined,
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                    cursor: "pointer",
                  }}
                >
                  <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                    <input
                      type="checkbox"
                      checked={isSelected}
                      onChange={() => toggleCheckbox("hz", selectedHz, hz)}
                      style={{ accentColor: "var(--accent)" }}
                    />
                    <span>{hz}</span>
                  </div>
                  {productsList.length > 0 && count > 0 && (
                    <span style={{ fontSize: 12, color: "var(--text-muted)", opacity: 0.8 }}>
                      {count}
                    </span>
                  )}
                </label>
              );
            })}
          </div>

          {/* Matrix */}
          <div className="filter-card">
            <div className="filter-title">Тип матрицы</div>
            {availableMatrix.filter(m => (matrixCounts[m] ?? 0) > 0 || selectedMatrix.includes(m)).map(m => {
              const isSelected = selectedMatrix.includes(m);
              const count = matrixCounts[m] ?? 0;
              return (
                <label
                  key={m}
                  className="filter-option"
                  style={{
                    color: isSelected ? "var(--accent)" : undefined,
                    fontWeight: isSelected ? 700 : undefined,
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                    cursor: "pointer",
                  }}
                >
                  <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                    <input
                      type="checkbox"
                      checked={isSelected}
                      onChange={() => toggleCheckbox("matrix", selectedMatrix, m)}
                      style={{ accentColor: "var(--accent)" }}
                    />
                    <span>{m}</span>
                  </div>
                  {productsList.length > 0 && count > 0 && (
                    <span style={{ fontSize: 12, color: "var(--text-muted)", opacity: 0.8 }}>
                      {count}
                    </span>
                  )}
                </label>
              );
            })}
          </div>

          {/* Special */}
          <div className="filter-card">
            <div className="filter-title">Особые условия</div>
            <label className="filter-option">
              <input
                type="checkbox"
                checked={inStockOnly}
                onChange={e => updateFilters({ in_stock: e.target.checked })}
              />
              <span>В наличии</span>
            </label>
            <label className="filter-option">
              <input
                type="checkbox"
                checked={saleOnly}
                onChange={e => updateFilters({ sale: e.target.checked })}
              />
              <span>Только акции</span>
            </label>
            <label className="filter-option">
              <input
                type="checkbox"
                checked={newOnly}
                onChange={e => updateFilters({ new: e.target.checked })}
              />
              <span>Только новинки</span>
            </label>
          </div>

          {filterOpen && (
            <div
              style={{
                position: "fixed",
                bottom: 0,
                left: 0,
                width: "320px",
                maxWidth: "85vw",
                padding: "16px 24px",
                background: "#fff",
                borderTop: "1.5px solid var(--border)",
                zIndex: 10000,
                boxSizing: "border-box",
              }}
            >
              <button
                className="btn btn-primary"
                style={{
                  width: "100%",
                  padding: 14,
                  fontSize: 16,
                  fontWeight: 800,
                  borderRadius: 12,
                }}
                onClick={() => setFilterOpen(false)}
              >
                Показать ({filtered.length})
              </button>
            </div>
          )}
        </aside>

        {/* Main Content */}
        <div style={{ flex: 1, minWidth: 0 }}>
          <div
            className="catalog-toolbar"
            style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              marginBottom: 20,
              flexWrap: "wrap",
              gap: 12,
            }}
          >
            <div style={{ fontWeight: 600, fontSize: 15, color: "var(--text-muted)" }}>
              Найдено:{" "}
              <span style={{ color: "var(--text)", fontWeight: 800 }}>
                {filtered.length}
              </span>{" "}
              моделей
            </div>
            <div style={{ display: "flex", gap: 12, alignItems: "center" }}>
              <select
                className="sort-select"
                value={sortBy}
                onChange={e => updateFilters({ sort: e.target.value })}
                style={{
                  padding: "10px 14px",
                  borderRadius: 10,
                  border: "1.5px solid var(--border)",
                  background: "#fff",
                  fontFamily: "inherit",
                  fontSize: 14,
                }}
              >
                <option value="popular">По популярности</option>
                <option value="price_asc">Сначала дешёвые</option>
                <option value="price_desc">Сначала дорогие</option>
                <option value="rating">По рейтингу</option>
                <option value="new">Сначала новинки</option>
              </select>
            </div>
          </div>

          {/* Active filters chips */}
          {hasActiveFilters && (
            <div
              style={{
                display: "flex",
                gap: 8,
                flexWrap: "wrap",
                marginBottom: 20,
                alignItems: "center",
              }}
            >
              {searchQuery.trim() && (
                <span
                  style={{
                    background: "var(--accent-tint)",
                    color: "var(--accent)",
                    padding: "6px 14px",
                    borderRadius: 100,
                    fontSize: 13,
                    fontWeight: 600,
                    display: "flex",
                    gap: 6,
                    alignItems: "center",
                  }}
                >
                  Поиск: «{searchQuery.trim()}»
                  <button
                    onClick={() => {
                      setSearchInput("");
                      updateFilters({ q: "" });
                    }}
                    style={{
                      background: "none",
                      border: "none",
                      cursor: "pointer",
                      color: "var(--accent)",
                      fontWeight: 800,
                      padding: 0,
                    }}
                  >
                    ×
                  </button>
                </span>
              )}

              {category && (
                <span
                  style={{
                    background: "var(--accent-tint)",
                    color: "var(--accent)",
                    padding: "6px 14px",
                    borderRadius: 100,
                    fontSize: 13,
                    fontWeight: 600,
                    display: "flex",
                    gap: 6,
                    alignItems: "center",
                  }}
                >
                  {activeCategoryLabel}
                  <button
                    onClick={() => updateFilters({ cat: "" })}
                    style={{
                      background: "none",
                      border: "none",
                      cursor: "pointer",
                      color: "var(--accent)",
                      fontWeight: 800,
                      padding: 0,
                    }}
                  >
                    ×
                  </button>
                </span>
              )}

              {brand && (
                <span
                  style={{
                    background: "var(--accent-tint)",
                    color: "var(--accent)",
                    padding: "6px 14px",
                    borderRadius: 100,
                    fontSize: 13,
                    fontWeight: 600,
                    display: "flex",
                    gap: 6,
                    alignItems: "center",
                  }}
                >
                  {brand}
                  <button
                    onClick={() => updateFilters({ brand: "" })}
                    style={{
                      background: "none",
                      border: "none",
                      cursor: "pointer",
                      color: "var(--accent)",
                      fontWeight: 800,
                      padding: 0,
                    }}
                  >
                    ×
                  </button>
                </span>
              )}

              {priceMin && (
                <span
                  style={{
                    background: "var(--accent-tint)",
                    color: "var(--accent)",
                    padding: "6px 14px",
                    borderRadius: 100,
                    fontSize: 13,
                    fontWeight: 600,
                    display: "flex",
                    gap: 6,
                    alignItems: "center",
                  }}
                >
                  От {parseInt(priceMin, 10).toLocaleString("ru-RU")} ₸
                  <button
                    onClick={() => {
                      setPriceMinInput("");
                      updateFilters({ price_min: "" });
                    }}
                    style={{
                      background: "none",
                      border: "none",
                      cursor: "pointer",
                      color: "var(--accent)",
                      fontWeight: 800,
                      padding: 0,
                    }}
                  >
                    ×
                  </button>
                </span>
              )}

              {priceMax && (
                <span
                  style={{
                    background: "var(--accent-tint)",
                    color: "var(--accent)",
                    padding: "6px 14px",
                    borderRadius: 100,
                    fontSize: 13,
                    fontWeight: 600,
                    display: "flex",
                    gap: 6,
                    alignItems: "center",
                  }}
                >
                  До {parseInt(priceMax, 10).toLocaleString("ru-RU")} ₸
                  <button
                    onClick={() => {
                      setPriceMaxInput("");
                      updateFilters({ price_max: "" });
                    }}
                    style={{
                      background: "none",
                      border: "none",
                      cursor: "pointer",
                      color: "var(--accent)",
                      fontWeight: 800,
                      padding: 0,
                    }}
                  >
                    ×
                  </button>
                </span>
              )}

              {selectedProcs.map(p => (
                <span
                  key={p}
                  style={{
                    background: "var(--accent-tint)",
                    color: "var(--accent)",
                    padding: "6px 14px",
                    borderRadius: 100,
                    fontSize: 13,
                    fontWeight: 600,
                    display: "flex",
                    gap: 6,
                    alignItems: "center",
                  }}
                >
                  {p}
                  <button
                    onClick={() => toggleCheckbox("proc", selectedProcs, p)}
                    style={{
                      background: "none",
                      border: "none",
                      cursor: "pointer",
                      color: "var(--accent)",
                      fontWeight: 800,
                      padding: 0,
                    }}
                  >
                    ×
                  </button>
                </span>
              ))}

              {selectedGPUs.map(g => (
                <span
                  key={g}
                  style={{
                    background: "var(--accent-tint)",
                    color: "var(--accent)",
                    padding: "6px 14px",
                    borderRadius: 100,
                    fontSize: 13,
                    fontWeight: 600,
                    display: "flex",
                    gap: 6,
                    alignItems: "center",
                  }}
                >
                  {g}
                  <button
                    onClick={() => toggleCheckbox("gpu", selectedGPUs, g)}
                    style={{
                      background: "none",
                      border: "none",
                      cursor: "pointer",
                      color: "var(--accent)",
                      fontWeight: 800,
                      padding: 0,
                    }}
                  >
                    ×
                  </button>
                </span>
              ))}

              {selectedRAMs.map(r => (
                <span
                  key={r}
                  style={{
                    background: "var(--accent-tint)",
                    color: "var(--accent)",
                    padding: "6px 14px",
                    borderRadius: 100,
                    fontSize: 13,
                    fontWeight: 600,
                    display: "flex",
                    gap: 6,
                    alignItems: "center",
                  }}
                >
                  {r}
                  <button
                    onClick={() => toggleCheckbox("ram", selectedRAMs, r)}
                    style={{
                      background: "none",
                      border: "none",
                      cursor: "pointer",
                      color: "var(--accent)",
                      fontWeight: 800,
                      padding: 0,
                    }}
                  >
                    ×
                  </button>
                </span>
              ))}

              {selectedDisplays.map(d => (
                <span
                  key={d}
                  style={{
                    background: "var(--accent-tint)",
                    color: "var(--accent)",
                    padding: "6px 14px",
                    borderRadius: 100,
                    fontSize: 13,
                    fontWeight: 600,
                    display: "flex",
                    gap: 6,
                    alignItems: "center",
                  }}
                >
                  {d}
                  <button
                    onClick={() => toggleCheckbox("display", selectedDisplays, d)}
                    style={{
                      background: "none",
                      border: "none",
                      cursor: "pointer",
                      color: "var(--accent)",
                      fontWeight: 800,
                      padding: 0,
                    }}
                  >
                    ×
                  </button>
                </span>
              ))}

              {selectedHz.map(h => (
                <span
                  key={h}
                  style={{
                    background: "var(--accent-tint)",
                    color: "var(--accent)",
                    padding: "6px 14px",
                    borderRadius: 100,
                    fontSize: 13,
                    fontWeight: 600,
                    display: "flex",
                    gap: 6,
                    alignItems: "center",
                  }}
                >
                  {h}
                  <button
                    onClick={() => toggleCheckbox("hz", selectedHz, h)}
                    style={{
                      background: "none",
                      border: "none",
                      cursor: "pointer",
                      color: "var(--accent)",
                      fontWeight: 800,
                      padding: 0,
                    }}
                  >
                    ×
                  </button>
                </span>
              ))}

              {selectedMatrix.map(m => (
                <span
                  key={m}
                  style={{
                    background: "var(--accent-tint)",
                    color: "var(--accent)",
                    padding: "6px 14px",
                    borderRadius: 100,
                    fontSize: 13,
                    fontWeight: 600,
                    display: "flex",
                    gap: 6,
                    alignItems: "center",
                  }}
                >
                  {m}
                  <button
                    onClick={() => toggleCheckbox("matrix", selectedMatrix, m)}
                    style={{
                      background: "none",
                      border: "none",
                      cursor: "pointer",
                      color: "var(--accent)",
                      fontWeight: 800,
                      padding: 0,
                    }}
                  >
                    ×
                  </button>
                </span>
              ))}

              {saleOnly && (
                <span
                  style={{
                    background: "var(--accent-tint)",
                    color: "var(--accent)",
                    padding: "6px 14px",
                    borderRadius: 100,
                    fontSize: 13,
                    fontWeight: 600,
                    display: "flex",
                    gap: 6,
                    alignItems: "center",
                  }}
                >
                  Акции
                  <button
                    onClick={() => updateFilters({ sale: false })}
                    style={{
                      background: "none",
                      border: "none",
                      cursor: "pointer",
                      color: "var(--accent)",
                      fontWeight: 800,
                      padding: 0,
                    }}
                  >
                    ×
                  </button>
                </span>
              )}

              {newOnly && (
                <span
                  style={{
                    background: "var(--accent-tint)",
                    color: "var(--accent)",
                    padding: "6px 14px",
                    borderRadius: 100,
                    fontSize: 13,
                    fontWeight: 600,
                    display: "flex",
                    gap: 6,
                    alignItems: "center",
                  }}
                >
                  Новинки
                  <button
                    onClick={() => updateFilters({ new: false })}
                    style={{
                      background: "none",
                      border: "none",
                      cursor: "pointer",
                      color: "var(--accent)",
                      fontWeight: 800,
                      padding: 0,
                    }}
                  >
                    ×
                  </button>
                </span>
              )}

              {inStockOnly && (
                <span
                  style={{
                    background: "var(--accent-tint)",
                    color: "var(--accent)",
                    padding: "6px 14px",
                    borderRadius: 100,
                    fontSize: 13,
                    fontWeight: 600,
                    display: "flex",
                    gap: 6,
                    alignItems: "center",
                  }}
                >
                  В наличии
                  <button
                    onClick={() => updateFilters({ in_stock: false })}
                    style={{
                      background: "none",
                      border: "none",
                      cursor: "pointer",
                      color: "var(--accent)",
                      fontWeight: 800,
                      padding: 0,
                    }}
                  >
                    ×
                  </button>
                </span>
              )}

              <button
                onClick={resetFilters}
                style={{
                  fontSize: 13,
                  color: "var(--text-muted)",
                  textDecoration: "underline",
                  background: "none",
                  border: "none",
                  cursor: "pointer",
                }}
              >
                Сбросить все
              </button>
            </div>
          )}

          {isLoading ? (
            <div
              style={{
                textAlign: "center",
                padding: "120px 20px",
                background: "var(--surface)",
                borderRadius: 24,
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                justifyContent: "center",
                gap: 16,
              }}
            >
              <div
                className="spinner"
                style={{
                  width: 44,
                  height: 44,
                  borderRadius: "50%",
                  border: "4px solid var(--border)",
                  borderTopColor: "var(--accent)",
                  animation: "spin 1s linear infinite",
                }}
              />
              <p style={{ color: "var(--text-muted)", fontWeight: 600 }}>
                Загрузка ноутбуков...
              </p>
              <style>{`
                @keyframes spin {
                  to { transform: rotate(360deg); }
                }
              `}</style>
            </div>
          ) : filtered.length === 0 ? (
            <div
              style={{
                textAlign: "center",
                padding: "80px 20px",
                background: "var(--surface)",
                borderRadius: 24,
              }}
            >
              <div style={{ fontSize: 60, marginBottom: 16 }}>🔍</div>
              <h3 style={{ fontSize: 22, fontWeight: 800, marginBottom: 8 }}>
                Ничего не найдено
              </h3>
              <p style={{ color: "var(--text-muted)", marginBottom: 24 }}>
                Попробуйте смягчить условия поиска или сбросить фильтры.
              </p>
              <button className="btn btn-primary" onClick={resetFilters}>
                Сбросить все фильтры
              </button>
            </div>
          ) : (
            <div className="product-grid product-grid-3">
              {filtered.map(p => (
                <ProductCard key={p.id} product={p} />
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default function CatalogPage() {
  return (
    <>
      <Header />
      <div className="page-hero">
        <div className="wrap">
          <div className="breadcrumbs">
            <Link href="/" prefetch={false}>Главная</Link>
            <svg
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              width="14"
              height="14"
            >
              <path d="M9 18l6-6-6-6" />
            </svg>
            <span>Каталог</span>
          </div>
          <h1>Каталог ноутбуков</h1>
          <p>
            Оригинальные ноутбуки от ведущих мировых брендов. Гарантия 1 год,
            доставка по всему Казахстану.
          </p>
        </div>
      </div>

      <section style={{ paddingTop: 48, paddingBottom: 80 }}>
        <div className="wrap">
          <Suspense fallback={<div>Загрузка...</div>}>
            <CatalogFilters />
          </Suspense>
        </div>
      </section>

      <CatalogSeoBlock />

      <Footer />
    </>
  );
}

function CatalogSeoBlock() {
  const [seoText, setSeoText] = useState("");

  useEffect(() => {
    fetchSettings()
      .then(s => {
        if (s.seo_catalog_text) {
          setSeoText(s.seo_catalog_text);
        }
      })
      .catch(() => {});
  }, []);

  if (!seoText) return null;

  return (
    <section style={{ padding: "0 0 64px 0", background: "var(--bg)" }}>
      <div className="wrap">
        <div
          className="seo-text-wrap"
          style={{
            background: "var(--surface)",
            borderRadius: 24,
            padding: "32px 36px",
            border: "1px solid var(--border)",
            lineHeight: 1.7,
            fontSize: 14.5,
            color: "var(--text-muted)",
          }}
          dangerouslySetInnerHTML={{ __html: seoText }}
        />
      </div>
    </section>
  );
}
