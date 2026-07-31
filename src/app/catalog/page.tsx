"use client";
import { useState, useMemo, useEffect } from "react";
import Link from "next/link";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import ProductCard from "@/components/ProductCard";
import { PRODUCTS, BRANDS, formatPrice, fetchLiveProducts } from "@/lib/data";
import { useSearchParams } from "next/navigation";
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
];

const PROCESSORS = ["Intel Core Ultra", "Intel Core i9", "Intel Core i7", "Intel Core i5", "AMD Ryzen 9", "AMD Ryzen 7", "AMD Ryzen 5", "Qualcomm Snapdragon", "Apple M"];
const GPUS = ["RTX 5080", "RTX 5070", "RTX 5060", "RTX 4060", "RTX 4050", "RTX 3050", "Radeon RX", "Intel Arc", "Intel Iris Xe", "AMD Radeon", "Apple GPU"];
const RAMS = ["8 ГБ", "12 ГБ", "16 ГБ", "32 ГБ", "64 ГБ"];
const DISPLAYS = ["13\"", "14\"", "15.6\"", "16\"", "17.3\""];
const REFRESH_RATES = ["60 Гц", "120 Гц", "144 Гц", "165 Гц", "240 Гц"];
const MATRIX_TYPES = ["IPS", "OLED", "Mini-LED", "VA", "TN", "WVA"];

function CatalogContent() {
  const searchParams = useSearchParams();
  return (
    <CatalogFilters
      key={searchParams.toString()}
      initialCat={searchParams.get("cat") || ""}
      initialBrand={searchParams.get("brand") || ""}
    />
  );
}

function CatalogFilters({ initialCat, initialBrand }: { initialCat: string; initialBrand: string }) {
  const [productsList, setProductsList] = useState<any[]>(PRODUCTS);
  const [category, setCategory] = useState(initialCat);
  const [brand, setBrand] = useState(initialBrand);
  const [priceMin, setPriceMin] = useState("");
  const [priceMax, setPriceMax] = useState("");
  const [selectedProcs, setSelectedProcs] = useState<string[]>([]);
  const [selectedGPUs, setSelectedGPUs] = useState<string[]>([]);
  const [selectedRAMs, setSelectedRAMs] = useState<string[]>([]);
  const [selectedDisplays, setSelectedDisplays] = useState<string[]>([]);
  const [selectedHz, setSelectedHz] = useState<string[]>([]);
  const [selectedMatrix, setSelectedMatrix] = useState<string[]>([]);
  const [inStockOnly, setInStockOnly] = useState(false);
  const [saleOnly, setSaleOnly] = useState(false);
  const [newOnly, setNewOnly] = useState(false);
  const [sortBy, setSortBy] = useState("popular");
  const [filterOpen, setFilterOpen] = useState(false);

  useEffect(() => {
    fetchLiveProducts().then(list => {
      if (list && list.length > 0) setProductsList(list);
    });
  }, []);

  const toggle = (arr: string[], val: string, set: (v: string[]) => void) => {
    set(arr.includes(val) ? arr.filter(v => v !== val) : [...arr, val]);
  };

  const filtered = useMemo(() => {
    let result = [...productsList];
    if (category) {
      if (category === "rtx") result = result.filter(p => p.gpu?.includes("RTX"));
      else if (category === "oled") result = result.filter(p => p.matrixType === "OLED");
      else result = result.filter(p => p.categorySlug === category);
    }
    if (brand) result = result.filter(p => p.brand.toLowerCase() === brand.toLowerCase());
    if (priceMin) result = result.filter(p => p.price >= parseInt(priceMin));
    if (priceMax) result = result.filter(p => p.price <= parseInt(priceMax));
    if (selectedProcs.length) result = result.filter(p => selectedProcs.some(proc => p.processor?.includes(proc)));
    if (selectedGPUs.length) result = result.filter(p => selectedGPUs.some(g => p.gpu?.includes(g)));
    if (selectedRAMs.length) result = result.filter(p => selectedRAMs.some(r => p.ram?.includes(r)));
    if (selectedDisplays.length) result = result.filter(p => selectedDisplays.some(d => p.display?.includes(d)));
    if (selectedHz.length) result = result.filter(p => selectedHz.some(hz => p.refreshRate?.includes(hz)));
    if (selectedMatrix.length) result = result.filter(p => selectedMatrix.includes(p.matrixType || ""));
    if (inStockOnly) result = result.filter(p => p.inStock);
    if (saleOnly) result = result.filter(p => p.isSale);
    if (newOnly) result = result.filter(p => p.isNew);

    switch (sortBy) {
      case "price_asc": result.sort((a, b) => a.price - b.price); break;
      case "price_desc": result.sort((a, b) => b.price - a.price); break;
      case "rating": result.sort((a, b) => b.rating - a.rating); break;
      case "new": result.sort((a, b) => (b.isNew ? 1 : 0) - (a.isNew ? 1 : 0)); break;
      default: result.sort((a, b) => (b.isHit ? 1 : 0) - (a.isHit ? 1 : 0));
    }
    return result;
  }, [productsList, category, brand, priceMin, priceMax, selectedProcs, selectedGPUs, selectedRAMs, selectedDisplays, selectedHz, selectedMatrix, inStockOnly, saleOnly, newOnly, sortBy]);

  const resetFilters = () => {
    setCategory(""); setBrand(""); setPriceMin(""); setPriceMax("");
    setSelectedProcs([]); setSelectedGPUs([]); setSelectedRAMs([]);
    setSelectedDisplays([]); setSelectedHz([]); setSelectedMatrix([]);
    setInStockOnly(false); setSaleOnly(false); setNewOnly(false);
    setSortBy("popular");
  };

  return (
    <div>
      {/* Mobile Filter Toggle Button */}
      <div style={{ display: "none" }} className="mobile-filter-bar">
        <button
          className="btn btn-primary"
          style={{ width: "100%", display: "flex", alignItems: "center", justifyContent: "center", gap: 10, padding: "14px", borderRadius: 12, marginBottom: 20 }}
          onClick={() => setFilterOpen(true)}
        >
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" width="20" height="20">
            <polygon points="22 3 2 3 10 12.46 10 19 14 21 14 12.46 22 3" />
          </svg>
          Фильтры {(category || brand || priceMin || priceMax || selectedProcs.length || selectedGPUs.length || selectedRAMs.length || inStockOnly || saleOnly || newOnly) ? "• Активны" : ""}
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
            padding: filterOpen ? "24px" : undefined,
            boxShadow: filterOpen ? "4px 0 24px rgba(0,0,0,0.15)" : undefined,
          }}
        >
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 16 }}>
            <span style={{ fontWeight: 800, fontSize: 18 }}>Фильтры</span>
            <div style={{ display: "flex", gap: 12, alignItems: "center" }}>
              <button onClick={resetFilters} style={{ fontSize: 13, color: "var(--accent)", fontWeight: 700, background: "none", border: "none", cursor: "pointer" }}>Сбросить</button>
              {filterOpen && (
                <button onClick={() => setFilterOpen(false)} style={{ background: "none", border: "none", fontSize: 22, cursor: "pointer", color: "var(--text-muted)" }}>✕</button>
              )}
            </div>
          </div>

          {/* Category */}
          <div className="filter-card">
            <div className="filter-title">Категория</div>
            {CATEGORIES_FILTER.map(c => (
              <label key={c.slug} className="filter-option" style={{ color: category === c.slug ? "var(--accent)" : undefined, fontWeight: category === c.slug ? 700 : undefined }}>
                <input type="radio" name="cat" checked={category === c.slug} onChange={() => setCategory(c.slug)} style={{ accentColor: "var(--accent)" }} />
                <span>{c.label}</span>
              </label>
            ))}
          </div>

          {/* Brand */}
          <div className="filter-card">
            <div className="filter-title">Бренд</div>
            {["", ...BRANDS.map(b => b.name)].map((b) => (
              <label key={b} className="filter-option" style={{ color: brand === b ? "var(--accent)" : undefined, fontWeight: brand === b ? 700 : undefined }}>
                <input type="radio" name="brand" checked={brand === b} onChange={() => setBrand(b)} style={{ accentColor: "var(--accent)" }} />
                <span>{b || "Все бренды"}</span>
              </label>
            ))}
          </div>

          {/* Price */}
          <div className="filter-card">
            <div className="filter-title">Цена (₸)</div>
            <div className="price-range" style={{ display: "flex", gap: 8 }}>
              <input className="price-input" type="number" placeholder="от 100 000" value={priceMin} onChange={e => setPriceMin(e.target.value)} style={{ width: "50%", padding: "10px", borderRadius: 8, border: "1px solid var(--border)" }} />
              <input className="price-input" type="number" placeholder="до 2 500 000" value={priceMax} onChange={e => setPriceMax(e.target.value)} style={{ width: "50%", padding: "10px", borderRadius: 8, border: "1px solid var(--border)" }} />
            </div>
          </div>

          {/* Processor */}
          <div className="filter-card">
            <div className="filter-title">Процессор</div>
            {PROCESSORS.map(p => (
              <label key={p} className="filter-option">
                <input type="checkbox" checked={selectedProcs.includes(p)} onChange={() => toggle(selectedProcs, p, setSelectedProcs)} />
                <span>{p}</span>
              </label>
            ))}
          </div>

          {/* GPU */}
          <div className="filter-card">
            <div className="filter-title">Видеокарта</div>
            {GPUS.map(g => (
              <label key={g} className="filter-option">
                <input type="checkbox" checked={selectedGPUs.includes(g)} onChange={() => toggle(selectedGPUs, g, setSelectedGPUs)} />
                <span>{g}</span>
              </label>
            ))}
          </div>

          {/* RAM */}
          <div className="filter-card">
            <div className="filter-title">Оперативная память</div>
            {RAMS.map(r => (
              <label key={r} className="filter-option">
                <input type="checkbox" checked={selectedRAMs.includes(r)} onChange={() => toggle(selectedRAMs, r, setSelectedRAMs)} />
                <span>{r}</span>
              </label>
            ))}
          </div>

          {/* Display */}
          <div className="filter-card">
            <div className="filter-title">Диагональ</div>
            {DISPLAYS.map(d => (
              <label key={d} className="filter-option">
                <input type="checkbox" checked={selectedDisplays.includes(d)} onChange={() => toggle(selectedDisplays, d, setSelectedDisplays)} />
                <span>{d}</span>
              </label>
            ))}
          </div>

          {/* Hz */}
          <div className="filter-card">
            <div className="filter-title">Частота экрана</div>
            {REFRESH_RATES.map(hz => (
              <label key={hz} className="filter-option">
                <input type="checkbox" checked={selectedHz.includes(hz)} onChange={() => toggle(selectedHz, hz, setSelectedHz)} />
                <span>{hz}</span>
              </label>
            ))}
          </div>

          {/* Matrix */}
          <div className="filter-card">
            <div className="filter-title">Тип матрицы</div>
            {MATRIX_TYPES.map(m => (
              <label key={m} className="filter-option">
                <input type="checkbox" checked={selectedMatrix.includes(m)} onChange={() => toggle(selectedMatrix, m, setSelectedMatrix)} />
                <span>{m}</span>
              </label>
            ))}
          </div>

          {/* Special */}
          <div className="filter-card">
            <div className="filter-title">Особые условия</div>
            <label className="filter-option">
              <input type="checkbox" checked={inStockOnly} onChange={e => setInStockOnly(e.target.checked)} />
              <span>В наличии</span>
            </label>
            <label className="filter-option">
              <input type="checkbox" checked={saleOnly} onChange={e => setSaleOnly(e.target.checked)} />
              <span>Только акции</span>
            </label>
            <label className="filter-option">
              <input type="checkbox" checked={newOnly} onChange={e => setNewOnly(e.target.checked)} />
              <span>Только новинки</span>
            </label>
          </div>

          {filterOpen && (
            <button
              className="btn btn-primary"
              style={{ width: "100%", marginTop: 20, padding: 14 }}
              onClick={() => setFilterOpen(false)}
            >
              Показать ({filtered.length})
            </button>
          )}
        </aside>

        {/* Main Content */}
        <div style={{ flex: 1, minWidth: 0 }}>
          <div className="catalog-toolbar" style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 20 }}>
            <div style={{ fontWeight: 600, fontSize: 15, color: "var(--text-muted)" }}>
              Найдено: <span style={{ color: "var(--text)", fontWeight: 800 }}>{filtered.length}</span> моделей
            </div>
            <div style={{ display: "flex", gap: 12, alignItems: "center" }}>
              <select className="sort-select" value={sortBy} onChange={e => setSortBy(e.target.value)} style={{ padding: "10px 14px", borderRadius: 10, border: "1.5px solid var(--border)", background: "#fff", fontFamily: "inherit", fontSize: 14 }}>
                <option value="popular">По популярности</option>
                <option value="price_asc">Сначала дешёвые</option>
                <option value="price_desc">Сначала дорогие</option>
                <option value="rating">По рейтингу</option>
                <option value="new">Сначала новинки</option>
              </select>
            </div>
          </div>

          {/* Active filters chips */}
          {(category || brand || priceMin || priceMax || selectedProcs.length > 0 || selectedGPUs.length > 0 || saleOnly || newOnly || inStockOnly) && (
            <div style={{ display: "flex", gap: 8, flexWrap: "wrap", marginBottom: 20 }}>
              {category && <span style={{ background: "var(--accent-tint)", color: "var(--accent)", padding: "6px 14px", borderRadius: 100, fontSize: 13, fontWeight: 600, display: "flex", gap: 6, alignItems: "center" }}>{CATEGORIES_FILTER.find(c => c.slug === category)?.label}<button onClick={() => setCategory("")} style={{ background: "none", border: "none", cursor: "pointer", color: "var(--accent)", fontWeight: 800, padding: 0 }}>×</button></span>}
              {brand && <span style={{ background: "var(--accent-tint)", color: "var(--accent)", padding: "6px 14px", borderRadius: 100, fontSize: 13, fontWeight: 600, display: "flex", gap: 6, alignItems: "center" }}>{brand}<button onClick={() => setBrand("")} style={{ background: "none", border: "none", cursor: "pointer", color: "var(--accent)", fontWeight: 800, padding: 0 }}>×</button></span>}
              {priceMin && <span style={{ background: "var(--accent-tint)", color: "var(--accent)", padding: "6px 14px", borderRadius: 100, fontSize: 13, fontWeight: 600, display: "flex", gap: 6, alignItems: "center" }}>От {parseInt(priceMin).toLocaleString("ru-RU")} ₸<button onClick={() => setPriceMin("")} style={{ background: "none", border: "none", cursor: "pointer", color: "var(--accent)", fontWeight: 800, padding: 0 }}>×</button></span>}
              {priceMax && <span style={{ background: "var(--accent-tint)", color: "var(--accent)", padding: "6px 14px", borderRadius: 100, fontSize: 13, fontWeight: 600, display: "flex", gap: 6, alignItems: "center" }}>До {parseInt(priceMax).toLocaleString("ru-RU")} ₸<button onClick={() => setPriceMax("")} style={{ background: "none", border: "none", cursor: "pointer", color: "var(--accent)", fontWeight: 800, padding: 0 }}>×</button></span>}
              {saleOnly && <span style={{ background: "var(--accent-tint)", color: "var(--accent)", padding: "6px 14px", borderRadius: 100, fontSize: 13, fontWeight: 600, display: "flex", gap: 6, alignItems: "center" }}>Акции<button onClick={() => setSaleOnly(false)} style={{ background: "none", border: "none", cursor: "pointer", color: "var(--accent)", fontWeight: 800, padding: 0 }}>×</button></span>}
              {newOnly && <span style={{ background: "var(--accent-tint)", color: "var(--accent)", padding: "6px 14px", borderRadius: 100, fontSize: 13, fontWeight: 600, display: "flex", gap: 6, alignItems: "center" }}>Новинки<button onClick={() => setNewOnly(false)} style={{ background: "none", border: "none", cursor: "pointer", color: "var(--accent)", fontWeight: 800, padding: 0 }}>×</button></span>}
              <button onClick={resetFilters} style={{ fontSize: 13, color: "var(--text-muted)", textDecoration: "underline", background: "none", border: "none", cursor: "pointer" }}>Сбросить все</button>
            </div>
          )}

          {filtered.length === 0 ? (
            <div style={{ textAlign: "center", padding: "80px 20px", background: "var(--surface)", borderRadius: 24 }}>
              <div style={{ fontSize: 60, marginBottom: 16 }}>🔍</div>
              <h3 style={{ fontSize: 22, fontWeight: 800, marginBottom: 8 }}>Ничего не найдено</h3>
              <p style={{ color: "var(--text-muted)", marginBottom: 24 }}>Попробуйте смягчить условия поиска или сбросить фильтры.</p>
              <button className="btn btn-primary" onClick={resetFilters}>Сбросить все фильтры</button>
            </div>
          ) : (
            <div className="product-grid">
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
            <Link href="/">Главная</Link>
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" width="14" height="14"><path d="M9 18l6-6-6-6"/></svg>
            <span>Каталог</span>
          </div>
          <h1>Каталог ноутбуков</h1>
          <p>Оригинальные ноутбуки от ведущих мировых брендов. Гарантия 1 год, доставка по всему Казахстану.</p>
        </div>
      </div>

      <section style={{ paddingTop: 48, paddingBottom: 80 }}>
        <div className="wrap">
          <Suspense fallback={<div>Загрузка...</div>}>
            <CatalogContent />
          </Suspense>
        </div>
      </section>

      <Footer />
    </>
  );
}
