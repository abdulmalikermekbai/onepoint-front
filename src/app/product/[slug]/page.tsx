import { notFound } from "next/navigation";
import Link from "next/link";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import ProductCard from "@/components/ProductCard";
import LaptopSVG from "@/components/LaptopSVG";
import { PRODUCTS, getProductBySlug, formatPrice } from "@/lib/data";
import ProductPageClient from "./ProductPageClient";
import ProductGallery from "@/components/ProductGallery";

export async function generateStaticParams() {
  return PRODUCTS.map(p => ({ slug: p.slug }));
}

interface Props {
  params: Promise<{ slug: string }>;
}

export default async function ProductPage({ params }: Props) {
  const { slug } = await params;
  const product = getProductBySlug(slug);
  if (!product) notFound();

  const similar = PRODUCTS.filter(p => p.id !== product.id && p.categorySlug === product.categorySlug).slice(0, 4);
  const waLink = `https://wa.me/77075511979?text=Здравствуйте!%20Хочу%20заказать:%20${encodeURIComponent(product.name)}%20за%20${encodeURIComponent(formatPrice(product.price))}`;

  const specs: [string, string][] = [
    ["Бренд", product.brand],
    ["Серия", product.series],
    ["Артикул", product.sku || "—"],
    ["Процессор", product.processor || "—"],
    ["Видеокарта", product.gpu || "—"],
    ["Оперативная память", product.ram || "—"],
    ["Накопитель", product.storage || "—"],
    ["Диагональ экрана", product.display || "—"],
    ["Разрешение", product.resolution || "—"],
    ["Частота обновления", product.refreshRate || "—"],
    ["Тип матрицы", product.matrixType || "—"],
    ["Операционная система", product.os || "—"],
    ["Цвет", product.color || "—"],
    ["Вес", product.weight || "—"],
    ["Аккумулятор", product.battery || "—"],
    ["Wi-Fi", product.wifi || "—"],
    ["Bluetooth", product.bluetooth || "—"],
    ["Веб-камера", product.camera || "—"],
    ["Разъёмы", product.ports || "—"],
    ["Размеры", product.dimensions || "—"],
    ["Гарантия", product.warranty || "—"],
  ];

  return (
    <>
      <Header />

      <div className="page-hero" style={{ padding: "36px 0" }}>
        <div className="wrap">
          <div className="breadcrumbs">
            <Link href="/">Главная</Link>
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" width="14" height="14"><path d="M9 18l6-6-6-6"/></svg>
            <Link href="/catalog">Каталог</Link>
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" width="14" height="14"><path d="M9 18l6-6-6-6"/></svg>
            <Link href={`/catalog?cat=${product.categorySlug}`}>{product.categoryName}</Link>
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" width="14" height="14"><path d="M9 18l6-6-6-6"/></svg>
            <span>{product.brand}</span>
          </div>
        </div>
      </div>

      <section style={{ paddingTop: 32, paddingBottom: 80 }}>
        <div className="wrap">
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 48, alignItems: "flex-start" }}>

            {/* ====== GALLERY ====== */}
            <div>
              <ProductGallery
                images={product.images || []}
                productName={product.name}
                svgColor1={product.svgColor1}
                svgColor2={product.svgColor2}
                bgGradient={product.bgGradient}
              />
            </div>

            {/* ====== INFO ====== */}
            <div>
              <div style={{ display: "flex", gap: 8, marginBottom: 12, flexWrap: "wrap" }}>
                {product.isNew && <span className="new-badge">Новинка</span>}
                {product.isHit && <span className="hit-badge">Хит продаж</span>}
                {product.isSale && <span className="discount-badge">Акция</span>}
              </div>

              <div className="product-brand" style={{ fontSize: 13, marginBottom: 8 }}>{product.brand} · {product.series}</div>
              <h1 style={{ fontSize: 28, fontWeight: 800, letterSpacing: "-.02em", lineHeight: 1.2, marginBottom: 16 }}>
                {product.name}
              </h1>

              <div className="rating-row" style={{ marginBottom: 20 }}>
                <span className="stars" style={{ fontSize: 16 }}>{"★".repeat(Math.round(product.rating))}</span>
                <span className="rating-num">{product.rating}</span>
                <span className="rating-count">({product.reviewCount} отзывов из 2GIS)</span>
              </div>

              {/* Price block */}
              <div style={{ background: "var(--surface)", borderRadius: 20, padding: 24, marginBottom: 24 }}>
                <div style={{ display: "flex", alignItems: "flex-start", gap: 16, marginBottom: 16 }}>
                  <div>
                    {product.oldPrice && (
                      <div className="price-old" style={{ fontSize: 15 }}>{formatPrice(product.oldPrice)}</div>
                    )}
                    <div className="price-new" style={{ fontSize: 34 }}>{formatPrice(product.price)}</div>
                    {product.saving && (
                      <div className="price-saving" style={{ fontSize: 13, marginTop: 4 }}>
                        Экономия {formatPrice(product.saving)}
                      </div>
                    )}
                  </div>
                  {product.discountPercent > 0 && (
                    <span className="discount-badge" style={{ fontSize: 16, padding: "8px 16px", marginTop: 4 }}>
                      -{product.discountPercent}%
                    </span>
                  )}
                </div>
              </div>

              {/* Availability */}
              <div style={{ display: "flex", gap: 20, marginBottom: 24, flexWrap: "wrap" }}>
                <div className={`stock-row ${product.inStock ? "stock-in" : "stock-order"}`} style={{ fontSize: 14 }}>
                  <span className="stock-dot" />
                  {product.inStock ? "В наличии — готов к отгрузке" : "Под заказ — 3–7 дней"}
                </div>
              </div>

              {/* CTA Buttons */}
              <div className="product-actions">
                <ProductPageClient product={{ id: product.id, name: product.name, price: product.price, slug: product.slug, sku: product.sku }} waLink={waLink} />
              </div>

              {/* Trust row */}
              <div className="trust-row" style={{ marginTop: 20 }}>
                <div className="trust-item">
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" width="16" height="16"><path d="M12 2 4 6v6c0 5 3.4 8.7 8 10 4.6-1.3 8-5 8-10V6l-8-4Z"/><path d="m9 12 2 2 4-4"/></svg>
                  Официальная гарантия {product.warranty}
                </div>
                <div className="trust-item">
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" width="16" height="16"><path d="M1 3h15v13H1z"/><path d="M16 8h4l3 3v5h-7V8z"/></svg>
                  Бесплатная доставка по РК
                </div>
                <div className="trust-item">
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" width="16" height="16"><path d="M9 12l2 2 4-4"/><circle cx="12" cy="12" r="10"/></svg>
                  Проверка перед отправкой
                </div>
                <div className="trust-item">
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" width="16" height="16"><path d="M22 16.9v3a2 2 0 0 1-2.2 2 19.8 19.8 0 0 1-8.6-3.1 19.5 19.5 0 0 1-6-6A19.8 19.8 0 0 1 2.1 4.2 2 2 0 0 1 4.1 2h3a2 2 0 0 1 2 1.7c.1.9.3 1.8.6 2.7a2 2 0 0 1-.5 2.1L8 9.7a16 16 0 0 0 6 6Z"/></svg>
                  Экспертная консультация
                </div>
              </div>
            </div>
          </div>

          {/* ====== TABS ====== */}
          <div style={{ marginTop: 64 }}>
            <ProductTabsClient product={product} specs={specs} />
          </div>

          {/* ====== ADVANTAGES ====== */}
          {product.advantages && product.advantages.length > 0 && (
            <div style={{ marginTop: 48 }}>
              <h2 style={{ fontSize: 26, fontWeight: 800, marginBottom: 24 }}>Почему стоит купить этот ноутбук</h2>
              <div style={{ display: "grid", gridTemplateColumns: "repeat(4,1fr)", gap: 16 }}>
                {product.advantages.map((adv, i) => (
                  <div key={i} style={{ background: "var(--surface)", borderRadius: 16, padding: "20px", display: "flex", gap: 12, alignItems: "flex-start" }}>
                    <span style={{ width: 28, height: 28, borderRadius: "50%", background: "var(--accent)", color: "#fff", display: "flex", alignItems: "center", justifyContent: "center", fontWeight: 800, fontSize: 13, flexShrink: 0 }}>{i + 1}</span>
                    <span style={{ fontSize: 14, fontWeight: 600, lineHeight: 1.4 }}>{adv}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* ====== SIMILAR ====== */}
          {similar.length > 0 && (
            <div style={{ marginTop: 64 }}>
              <div className="section-head">
                <div>
                  <div className="eyebrow">Похожие товары</div>
                  <h2 className="section-title">Вам также может понравиться</h2>
                </div>
              </div>
              <div className="product-grid">
                {similar.map(p => <ProductCard key={p.id} product={p} />)}
              </div>
            </div>
          )}

          {/* ====== FREQUENTLY BOUGHT ====== */}
          <div style={{ marginTop: 48, background: "var(--surface)", borderRadius: 24, padding: 32 }}>
            <h3 style={{ fontSize: 22, fontWeight: 800, marginBottom: 20 }}>Часто покупают вместе</h3>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(4,1fr)", gap: 12 }}>
              {[
                { name: "Мышь беспроводная Logitech MX Master 3", price: 45990 },
                { name: "Сумка-рюкзак для ноутбука 15.6\"", price: 18990 },
                { name: "Охлаждающая подставка", price: 12990 },
                { name: "USB-C хаб 7-in-1", price: 15990 },
              ].map(acc => (
                <div key={acc.name} style={{ background: "#fff", borderRadius: 14, padding: 16, border: "1.5px solid var(--border)", display: "flex", flexDirection: "column", gap: 10 }}>
                  <div style={{ fontSize: 40, textAlign: "center" }}>🖱️</div>
                  <div style={{ fontSize: 13.5, fontWeight: 600, lineHeight: 1.3 }}>{acc.name}</div>
                  <div style={{ fontSize: 15, fontWeight: 800, color: "var(--accent)" }}>{formatPrice(acc.price)}</div>
                  <a
                    href={`https://wa.me/77075511979?text=Хочу%20добавить%20к%20заказу:%20${encodeURIComponent(acc.name)}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="btn btn-ghost btn-xs"
                    style={{ textAlign: "center" }}
                  >
                    Добавить
                  </a>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      <Footer />
    </>
  );
}

// Tabs as a server-friendly component (client interactivity minimal)
function ProductTabsClient({ product, specs }: {
  product: ReturnType<typeof getProductBySlug>;
  specs: [string, string][];
}) {
  if (!product) return null;
  return (
    <div>
      <div style={{ borderBottom: "2px solid var(--border)", marginBottom: 32, display: "flex", gap: 4, overflowX: "auto" }}>
        {["Характеристики", "Описание", "Комплектация", "Отзывы"].map((tab, i) => (
          <span key={tab} style={{ padding: "14px 20px", fontWeight: 600, fontSize: 15, color: i === 0 ? "var(--accent)" : "var(--text-muted)", borderBottom: i === 0 ? "2px solid var(--accent)" : "2px solid transparent", marginBottom: -2, whiteSpace: "nowrap", cursor: "pointer" }}>
            {tab}
          </span>
        ))}
      </div>

      {/* Specs table */}
      <table className="spec-table">
        <tbody>
          {specs.map(([label, val]) => (
            <tr key={label}>
              <td>{label}</td>
              <td>{val}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
