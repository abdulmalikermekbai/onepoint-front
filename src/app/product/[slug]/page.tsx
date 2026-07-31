import { notFound } from "next/navigation";
import Link from "next/link";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import ProductCard from "@/components/ProductCard";
import { Product, fetchLiveProductBySlug, fetchLiveProducts, formatPrice, formatGpu } from "@/lib/data";
import ProductPageClient, { ProductTabsInteractive, ProductGallery } from "./ProductPageClient";

export const dynamic = "force-dynamic";

interface Props {
  params: Promise<{ slug: string }>;
}

export async function generateMetadata({ params }: Props): Promise<import("next").Metadata> {
  const { slug } = await params;
  const product = await fetchLiveProductBySlug(slug);
  if (!product) return {};

  const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://onepoint.kz';

  return {
    title: product.name,
    description: product.shortDescription || `Купить ${product.name} в интернет-магазине OnePoint. Лучшая цена, гарантия.`,
    alternates: {
      canonical: `/product/${product.slug}`,
    },
    openGraph: {
      title: product.name,
      description: product.shortDescription || `Купить ${product.name} по выгодной цене`,
      url: `${baseUrl}/product/${product.slug}`,
      images: product.images && product.images[0] ? [
        { url: product.images[0] }
      ] : [],
    },
  };
}

export default async function ProductPage({ params }: Props) {
  const { slug } = await params;
  const product = await fetchLiveProductBySlug(slug);
  if (!product) notFound();

  const similar = (product.related && product.related.length > 0) ? product.related : [];
  const waLink = `https://wa.me/77075511979?text=Здравствуйте!%20Хочу%20заказать:%20${encodeURIComponent(product.name)}%20за%20${encodeURIComponent(formatPrice(product.price))}`;

  let frequentlyBoughtList: Product[] = [];
  if (product.frequentlyBoughtIds) {
    const allProducts = await fetchLiveProducts();
    const ids = product.frequentlyBoughtIds.split(",").map(id => parseInt(id.trim())).filter(id => !isNaN(id));
    frequentlyBoughtList = ids.map(id => allProducts.find(p => p.id === id)).filter((p): p is Product => !!p);
  }

  const specs: [string, string][] = [
    ["Бренд", product.brand],
    ["Серия", product.series || "—"],
    ["Артикул", product.sku || "—"],
    ["Процессор", product.processor || "—"],
    ["Видеокарта", formatGpu(product.gpu)],
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

  const schemaOrg = {
    "@context": "https://schema.org/",
    "@type": "Product",
    "name": product.name,
    "image": product.images && product.images[0] ? [product.images[0]] : [],
    "description": product.shortDescription || `Ноутбук ${product.name}`,
    "sku": product.sku,
    "brand": {
      "@type": "Brand",
      "name": product.brand
    },
    "offers": {
      "@type": "Offer",
      "url": `${process.env.NEXT_PUBLIC_SITE_URL || 'https://onepoint.kz'}/product/${product.slug}`,
      "priceCurrency": "KZT",
      "price": product.price,
      "priceValidUntil": new Date(new Date().setFullYear(new Date().getFullYear() + 1)).toISOString().split('T')[0],
      "itemCondition": "https://schema.org/NewCondition",
      "availability": "https://schema.org/InStock",
      "seller": {
        "@type": "Organization",
        "name": "OnePoint"
      }
    }
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(schemaOrg) }}
      />
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
          <div className="product-detail-grid">


            {/* ====== GALLERY ====== */}
            <div style={{ position: "relative" }}>
              <ProductGallery
                images={(product.images || []).map((img: any) => ({
                  image_url: typeof img === "string" ? img : (img.url || img.image_url),
                  alt_text: product.name,
                  is_main: false
                }))}
                mainImage={product.image}
                productName={product.name}
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
                  {Boolean(product.discountPercent) && (
                    <span className="product-page-badge badge-sale" style={{ fontSize: 16, padding: "8px 16px", marginTop: 4 }}>
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
                  Гарантия 1 год
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
            <ProductTabsInteractive product={product} specs={specs} />
          </div>

          {/* ====== ADVANTAGES OR WHY_BUY ====== */}
          {product.whyBuyText ? (
            <div
              style={{
                marginTop: 32,
                background: "var(--surface)",
                borderRadius: 24,
                padding: "32px 40px",
                lineHeight: 1.6,
                color: "var(--text)",
                fontSize: 15
              }}
              dangerouslySetInnerHTML={{ __html: product.whyBuyText }}
            />
          ) : product.advantages && product.advantages.length > 0 ? (
            <div style={{ marginTop: 32, background: "var(--surface)", borderRadius: 24, padding: "32px 40px" }}>
              <h3 style={{ margin: "0 0 20px", fontSize: 20, fontWeight: 800 }}>Почему стоит купить:</h3>
              <ul style={{ margin: 0, paddingLeft: 20, display: "flex", flexDirection: "column", gap: 12 }}>
                {product.advantages.map((adv, i) => (
                  <li key={i} style={{ color: "var(--text-muted)", fontSize: 15 }}>
                    <span style={{ color: "var(--text)", fontWeight: 500 }}>{adv}</span>
                  </li>
                ))}
              </ul>
            </div>
          ) : null}

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
            <h3 style={{ fontSize: 22, fontWeight: 800, marginBottom: 20 }}>Часто покупают вместе (Аксессуары)</h3>
            <div className="bought-together-grid">
              {frequentlyBoughtList.length > 0 ? (
                frequentlyBoughtList.map(acc => (
                  <div key={acc.id} style={{ background: "#fff", borderRadius: 14, padding: 16, border: "1.5px solid var(--border)", display: "flex", flexDirection: "column", gap: 10, textAlign: "center" }}>
                    <div style={{ height: 120, display: "flex", alignItems: "center", justifyContent: "center", background: "#f8f9fa", borderRadius: 8, padding: 8 }}>
                      {acc.image ? (
                        <img src={acc.image} alt={acc.name} style={{ maxHeight: "100%", maxWidth: "100%", objectFit: "contain" }} />
                      ) : (
                        <div style={{ color: "var(--text-soft)" }}>🛒</div>
                      )}
                    </div>
                    <div style={{ fontSize: 13.5, fontWeight: 600, lineHeight: 1.3, height: 36, overflow: "hidden", textOverflow: "ellipsis" }}>
                      <Link href={`/product/${acc.slug}`} style={{ textDecoration: "none", color: "inherit" }}>{acc.name}</Link>
                    </div>
                    <div style={{ fontSize: 15, fontWeight: 800, color: "var(--accent)" }}>{formatPrice(acc.price)}</div>
                    <a
                      href={`https://wa.me/77075511979?text=Хочу%20добавить%20к%20заказу:%20${encodeURIComponent(acc.name)}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="btn btn-ghost btn-xs"
                      style={{ textAlign: "center", width: "100%" }}
                    >
                      Добавить
                    </a>
                  </div>
                ))
              ) : (
                [
                  { name: "Мышь беспроводная Logitech MX Master 3", price: 45990, image: "https://api.onepoint.kz/uploads/logitech_mx.png" },
                  { name: "Сумка-рюкзак для ноутбука 15.6\"", price: 18990, image: "https://api.onepoint.kz/uploads/backpack.png" },
                  { name: "Охлаждающая подставка для ноутбука", price: 12990, image: "https://api.onepoint.kz/uploads/cooler.png" },
                  { name: "USB-C хаб 7-in-1 мультипорт", price: 15990, image: "https://api.onepoint.kz/uploads/hub.png" },
                ].map(acc => (
                  <div key={acc.name} style={{ background: "#fff", borderRadius: 14, padding: 16, border: "1.5px solid var(--border)", display: "flex", flexDirection: "column", gap: 10, textAlign: "center" }}>
                    <div style={{ height: 120, display: "flex", alignItems: "center", justifyContent: "center", background: "#f8f9fa", borderRadius: 8, padding: 8 }}>
                      <img src={acc.image} alt={acc.name} style={{ maxHeight: "100%", maxWidth: "100%", objectFit: "contain" }} onError={(e) => { e.currentTarget.src = ""; }} />
                    </div>
                    <div style={{ fontSize: 13.5, fontWeight: 600, lineHeight: 1.3, height: 36, overflow: "hidden", textOverflow: "ellipsis" }}>{acc.name}</div>
                    <div style={{ fontSize: 15, fontWeight: 800, color: "var(--accent)" }}>{formatPrice(acc.price)}</div>
                    <a
                      href={`https://wa.me/77075511979?text=Хочу%20добавить%20к%20заказу:%20${encodeURIComponent(acc.name)}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="btn btn-ghost btn-xs"
                      style={{ textAlign: "center", width: "100%" }}
                    >
                      Добавить
                    </a>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      </section>

      <Footer />
    </>
  );
}

// ProductTabsClient is imported or rendered directly as ProductTabsInteractive
