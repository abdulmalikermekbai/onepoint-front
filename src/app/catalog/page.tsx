"use client";
import { useState, useMemo, useEffect, useCallback } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import ProductCard from "@/components/ProductCard";
import { PRODUCTS, BRANDS, fetchLiveProducts, fetchSettings, fetchLiveBrands, Product } from "@/lib/data";
import { Suspense } from "react";

const CATEGORIES_FILTER = [
  { slug: "", label: "Все категории" },
  { slug: "gaming", label: "Игровые" },
  { slug: "office", label: "Для работы" },
  { slug: "student", label: "Для учёбы" },
  { slug: "ultrabook", label: "Ультрабуки" },
  { slug: "macbook", label: "MacBook" },
  { slug: "designer", label: "Для дизайнеров" },
  { slug: "dev", label: "Для разработчиков" },
  { slug: "video", label: "Видеомонтаж" },
  { slug: "rtx", label: "С RTX" },
  { slug: "oled", label: "OLED" },
  { slug: "business", label: "Для бизнеса" },
  { slug: "accessories", label: "Аксессуары" },
];

const PROCESSORS = [
  "Intel Core Ultra",
  "Intel Core i9",
  "Intel Core i7",
  "Intel Core i5",
  "AMD Ryzen 9",
  "AMD Ryzen 7",
  "AMD Ryzen 5",
  "Qualcomm Snapdragon",
  "Apple M"
];

const GPUS = [
  "RTX 5080",
  "RTX 5070",
  "RTX 5060",
  "RTX 4060",
  "RTX 4050",
  "RTX 3050",
  "Radeon RX",
  "Intel Arc",
  "Intel Iris Xe",
  "AMD Radeon",
  "Apple GPU"
];

const RAMS = ["8 ГБ", "12 ГБ", "16 ГБ", "32 ГБ", "64 ГБ"];
const DISPLAYS = ["13\"", "14\"", "15.6\"", "16\"", "17.3\""];
const REFRESH_RATES = ["60 Гц", "120 Гц", "144 Гц", "165 Гц", "240 Гц"];
const MATRIX_TYPES = ["IPS", "OLED", "Mini-LED", "VA", "TN", "WVA"];

function matchCategory(p: Product, catSlug: string): boolean {
  if (!catSlug) return true;
  const slug = catSlug.toLowerCase();

  if (slug === "accessories") {
    return (
      p.categorySlug?.toLowerCase() === "accessories" ||
      Boolean(p.categories && p.categories.some(c => c.toLowerCase() === "accessories")) ||
      Boolean(p.categoryName?.toLowerCase().includes("аксессуар")) ||
      Boolean(p.categoryName?.toLowerCase().includes("мышь")) ||
      Boolean(p.categoryName?.toLowerCase().includes("сумк"))
    );
  }
  if (slug === "rtx") {
    return Boolean(p.gpu?.toUpperCase().includes("RTX") || p.cardGpu?.toUpperCase().includes("RTX"));
  }
  if (slug === "oled") {
    return p.matrixType?.toLowerCase() === "oled" || Boolean(p.display?.toLowerCase().includes("oled"));
  }
  if (slug === "macbook") {
    return p.brand?.toLowerCase() === "apple" || p.categorySlug?.toLowerCase() === "macbook" || Boolean(p.categories?.includes("macbook"));
  }
  if (slug === "designer") {
    return (
      p.categorySlug === "designer" ||
      Boolean(p.categories && p.categories.includes("designer")) ||
      Boolean(p.matrixType?.toLowerCase() === "oled") ||
      Boolean(p.gpu?.toUpperCase().includes("RTX")) ||
      Boolean(p.ram?.includes("16")) ||
      Boolean(p.ram?.includes("32"))
    );
  }
  if (slug === "dev" || slug === "programmer") {
    return (
      p.categorySlug === "dev" ||
      p.categorySlug === "programmer" ||
      Boolean(p.categories && (p.categories.includes("dev") || p.categories.includes("programmer"))) ||
      Boolean(p.ram?.includes("16")) ||
      Boolean(p.ram?.includes("32")) ||
      Boolean(p.ram?.includes("64")) ||
      Boolean(p.processor?.includes("Core i7")) ||
      Boolean(p.processor?.includes("Core i9")) ||
      Boolean(p.processor?.includes("Ryzen 7")) ||
      Boolean(p.processor?.includes("Ryzen 9")) ||
      Boolean(p.processor?.includes("Ultra"))
    );
  }
  if (slug === "student") {
    return (
      p.categorySlug === "student" ||
      Boolean(p.categories && p.categories.includes("student")) ||
      p.categorySlug === "office" ||
      p.categorySlug === "ultrabook"
    );
  }
  if (slug === "office") {
    return (
      p.categorySlug === "office" ||
      Boolean(p.categories && p.categories.includes("office")) ||
      p.categorySlug === "ultrabook" ||
      p.categorySlug === "business" ||
      p.categorySlug === "student"
    );
  }
  if (slug === "ultrabook") {
    return (
      p.categorySlug === "ultrabook" ||
      Boolean(p.categories && p.categories.includes("ultrabook")) ||
      Boolean(p.weight && (p.weight.includes("1.") || p.weight.includes("0."))) ||
      p.categorySlug === "office"
    );
  }
  if (slug === "gaming") {
    return (
      p.categorySlug === "gaming" ||
      Boolean(p.categories && p.categories.includes("gaming")) ||
      Boolean(p.gpu?.toUpperCase().includes("RTX")) ||
      Boolean(p.gpu?.toUpperCase().includes("GTX")) ||
      Boolean(p.gpu?.toLowerCase().includes("radeon rx"))
    );
  }
  if (slug === "video") {
    return (
      p.categorySlug === "video" ||
      Boolean(p.categories && p.categories.includes("video")) ||
      Boolean(p.gpu?.toUpperCase().includes("RTX")) ||
      Boolean(p.cardGpu?.toUpperCase().includes("RTX")) ||
      Boolean(p.gpu?.toLowerCase().includes("radeon rx")) ||
      Boolean(p.ram?.includes("16")) ||
      Boolean(p.ram?.includes("32")) ||
      Boolean(p.ram?.includes("64")) ||
      Boolean(p.processor?.includes("Core i7")) ||
      Boolean(p.processor?.includes("Core i9")) ||
      Boolean(p.processor?.includes("Ryzen 7")) ||
      Boolean(p.processor?.includes("Ryzen 9")) ||
      Boolean(p.processor?.includes("Ultra")) ||
      Boolean(p.processor?.includes("Apple M"))
    );
  }
  if (slug === "business") {
    return (
      p.categorySlug === "business" ||
      Boolean(p.categories && p.categories.includes("business")) ||
      p.categorySlug === "office"
    );
  }

  return (
    p.categorySlug?.toLowerCase() === slug ||
    Boolean(p.categories && p.categories.some(c => c.toLowerCase() === slug)) ||
    p.categoryName?.toLowerCase() === slug ||
    Boolean(p.categoryName?.toLowerCase().includes(slug))
  );
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

function CatalogFilters() {
  const router = useRouter();
  const searchParams = useSearchParams();

  // 1. Live Data
  const [isLoading, setIsLoading] = useState(true);
  const [productsList, setProductsList] = useState<Product[]>(PRODUCTS);
  const [liveBrands, setLiveBrands] = useState<{ name: string; slug: string }[]>(BRANDS);

  useEffect(() => {
    setIsLoading(true);
    Promise.all([fetchLiveProducts(), fetchLiveBrands()])
      .then(([list, brands]) => {
        if (list && list.length > 0) setProductsList(list);
        if (brands && brands.length > 0) setLiveBrands(brands);
        setIsLoading(false);
      })
      .catch(() => {
        setIsLoading(false);
      });
  }, []);

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

  // 4. Update URL params seamlessly
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
  };

  // 5. Category Counts
  const categoryCounts = useMemo(() => {
    const counts: Record<string, number> = {};
    CATEGORIES_FILTER.forEach(cat => {
      if (!cat.slug) {
        counts[""] = productsList.length;
      } else {
        counts[cat.slug] = productsList.filter(p => matchCategory(p, cat.slug)).length;
      }
    });
    return counts;
  }, [productsList]);

  // 6. Brand Counts
  const brandCounts = useMemo(() => {
    const counts: Record<string, number> = {};
    liveBrands.forEach(b => {
      counts[b.name] = productsList.filter(
        p => p.brand?.toLowerCase() === b.name.toLowerCase()
      ).length;
    });
    return counts;
  }, [productsList, liveBrands]);

  // 7. Filtered & Sorted Products
  const filtered = useMemo(() => {
    let result = [...productsList];

    const currentSearch = searchInput.trim() || searchQuery.trim();
    if (currentSearch) {
      const q = currentSearch.toLowerCase();
      result = result.filter(p =>
        p.name?.toLowerCase().includes(q) ||
        p.brand?.toLowerCase().includes(q) ||
        p.model?.toLowerCase().includes(q) ||
        p.series?.toLowerCase().includes(q) ||
        p.sku?.toLowerCase().includes(q) ||
        p.processor?.toLowerCase().includes(q) ||
        p.gpu?.toLowerCase().includes(q) ||
        p.categoryName?.toLowerCase().includes(q) ||
        p.cardProcessor?.toLowerCase().includes(q) ||
        p.cardGpu?.toLowerCase().includes(q)
      );
    }

    if (category) {
      result = result.filter(p => matchCategory(p, category));
    }

    if (brand) {
      result = result.filter(p => p.brand?.toLowerCase() === brand.toLowerCase());
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
        selectedProcs.some(
          proc =>
            p.processor?.toLowerCase().includes(proc.toLowerCase()) ||
            p.cardProcessor?.toLowerCase().includes(proc.toLowerCase())
        )
      );
    }

    if (selectedGPUs.length) {
      result = result.filter(p =>
        selectedGPUs.some(
          g =>
            p.gpu?.toLowerCase().includes(g.toLowerCase()) ||
            p.cardGpu?.toLowerCase().includes(g.toLowerCase())
        )
      );
    }

    if (selectedRAMs.length) {
      result = result.filter(p =>
        selectedRAMs.some(
          r =>
            p.ram?.toLowerCase().includes(r.toLowerCase()) ||
            p.cardRam?.toLowerCase().includes(r.toLowerCase())
        )
      );
    }

    if (selectedDisplays.length) {
      result = result.filter(p =>
        selectedDisplays.some(
          d =>
            p.display?.includes(d.replace("\"", "")) ||
            p.display?.includes(d)
        )
      );
    }

    if (selectedHz.length) {
      result = result.filter(p =>
        selectedHz.some(
          hz =>
            p.refreshRate?.toLowerCase().includes(hz.toLowerCase()) ||
            p.refreshRate?.includes(hz.replace(" Гц", ""))
        )
      );
    }

    if (selectedMatrix.length) {
      result = result.filter(p =>
        selectedMatrix.some(m => p.matrixType?.toLowerCase() === m.toLowerCase())
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
    const found = CATEGORIES_FILTER.find(
      c => c.slug.toLowerCase() === category.toLowerCase()
    );
    return found ? found.label : category;
  }, [category]);

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
    <div>
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
            top: filterOpen ? 0 : 90,
            left: filterOpen ? 0 : undefined,
            bottom: filterOpen ? 0 : undefined,
            zIndex: filterOpen ? 9999 : undefined,
            width: filterOpen ? "320px" : undefined,
            maxWidth: filterOpen ? "85vw" : undefined,
            background: filterOpen ? "#fff" : undefined,
            overflowY: filterOpen ? "auto" : undefined,
            paddingBottom: filterOpen ? "90px" : undefined,
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
            {CATEGORIES_FILTER.map(c => {
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
            {["", ...liveBrands.map(b => b.name)].map(b => {
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
            {PROCESSORS.map(p => (
              <label key={p} className="filter-option">
                <input
                  type="checkbox"
                  checked={selectedProcs.includes(p)}
                  onChange={() => toggleCheckbox("proc", selectedProcs, p)}
                />
                <span>{p}</span>
              </label>
            ))}
          </div>

          {/* GPU */}
          <div className="filter-card">
            <div className="filter-title">Видеокарта</div>
            {GPUS.map(g => (
              <label key={g} className="filter-option">
                <input
                  type="checkbox"
                  checked={selectedGPUs.includes(g)}
                  onChange={() => toggleCheckbox("gpu", selectedGPUs, g)}
                />
                <span>{g}</span>
              </label>
            ))}
          </div>

          {/* RAM */}
          <div className="filter-card">
            <div className="filter-title">Оперативная память</div>
            {RAMS.map(r => (
              <label key={r} className="filter-option">
                <input
                  type="checkbox"
                  checked={selectedRAMs.includes(r)}
                  onChange={() => toggleCheckbox("ram", selectedRAMs, r)}
                />
                <span>{r}</span>
              </label>
            ))}
          </div>

          {/* Display */}
          <div className="filter-card">
            <div className="filter-title">Диагональ</div>
            {DISPLAYS.map(d => (
              <label key={d} className="filter-option">
                <input
                  type="checkbox"
                  checked={selectedDisplays.includes(d)}
                  onChange={() => toggleCheckbox("display", selectedDisplays, d)}
                />
                <span>{d}</span>
              </label>
            ))}
          </div>

          {/* Hz */}
          <div className="filter-card">
            <div className="filter-title">Частота экрана</div>
            {REFRESH_RATES.map(hz => (
              <label key={hz} className="filter-option">
                <input
                  type="checkbox"
                  checked={selectedHz.includes(hz)}
                  onChange={() => toggleCheckbox("hz", selectedHz, hz)}
                />
                <span>{hz}</span>
              </label>
            ))}
          </div>

          {/* Matrix */}
          <div className="filter-card">
            <div className="filter-title">Тип матрицы</div>
            {MATRIX_TYPES.map(m => (
              <label key={m} className="filter-option">
                <input
                  type="checkbox"
                  checked={selectedMatrix.includes(m)}
                  onChange={() => toggleCheckbox("matrix", selectedMatrix, m)}
                />
                <span>{m}</span>
              </label>
            ))}
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
