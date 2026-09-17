import { notFound } from "next/navigation";
import Link from "next/link";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import ProductCard from "@/components/ProductCard";
import { Product, fetchLiveProductBySlug, fetchLiveProducts, formatPrice, formatGpu } from "@/lib/data";
import { ProductTabsInteractive, ProductHeroSection } from "./ProductPageClient";

export const revalidate = 60;
export const dynamicParams = true;

export async function generateStaticParams() {
  const products = await fetchLiveProducts();
  return products.map((product) => ({
    slug: product.slug,
  }));
}

interface Props {
  params: Promise<{ slug: string }>;
}

export async function generateMetadata({ params }: Props): Promise<import("next").Metadata> {
  const { slug } = await params;
  const product = await fetchLiveProductBySlug(slug);
  if (!product) return {};

  const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://onepoint.kz";
  const seoTitle =
    product.metaTitle ||
    `Купить ${product.name} в Алматы | OnePoint.kz`;
  const seoDescription =
    product.metaDescription ||
    product.shortDescription ||
    `Купить ${product.name} по цене ${formatPrice(product.price)} с гарантией 1 год в интернет-магазине OnePoint.kz. Доставка по Алматы и Казахстану.`;

  return {
    title: seoTitle,
    description: seoDescription,
    alternates: {
      canonical: `${baseUrl}/product/${product.slug}`,
    },
    openGraph: {
      title: seoTitle,
      description: seoDescription,
      url: `${baseUrl}/product/${product.slug}`,
      type: "website",
      siteName: "OnePoint.kz",
      images:
        product.images && product.images[0]
          ? [
              {
                url: product.images[0],
                alt: product.name,
              },
            ]
          : [],
    },
    twitter: {
      card: "summary_large_image",
      title: seoTitle,
      description: seoDescription,
      images: product.images && product.images[0] ? [product.images[0]] : [],
    },
  };
}

export default async function ProductPage({ params }: Props) {
  const { slug } = await params;
  const product = await fetchLiveProductBySlug(slug);
  if (!product) notFound();

  const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://onepoint.kz";
  const similar = product.related && product.related.length > 0 ? product.related : [];
  const waLink = `https://wa.me/77075511979?text=Здравствуйте!%20Хочу%20заказать:%20${encodeURIComponent(product.name)}%20за%20${encodeURIComponent(formatPrice(product.price))}`;

  const specs: [string, string][] = [
    ["Бренд", product.brand],
    ["Серия", product.series || "—"],
    ["Модель", product.model || product.name],
    ["Партномер", product.sku || "—"],
    ["Состояние", product.condition || "—"],
    ["Гарантия", product.warranty || "—"],
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
    ["Клавиатура", product.keyboard || "—"],
  ];

  if (product.dynamicCharacteristics && product.dynamicCharacteristics.length > 0) {
    product.dynamicCharacteristics.forEach((char) => {
      specs.push([char.name, char.value]);
    });
  }

  // Schema.org: Product
  const schemaProduct: Record<string, any> = {
    "@context": "https://schema.org/",
    "@type": "Product",
    name: product.name,
    image: product.images && product.images.length > 0 ? product.images : [product.image],
    description:
      product.shortDescription ||
      product.description ||
      `Ноутбук ${product.name} по цене ${formatPrice(product.price)} с гарантией 1 год.`,
    sku: product.sku || `OP-${product.id}`,
    mpn: product.sku || product.model || `OP-${product.id}`,
    brand: {
      "@type": "Brand",
      name: product.brand || "OnePoint",
    },
    offers: {
      "@type": "Offer",
      url: `${baseUrl}/product/${product.slug}`,
      priceCurrency: "KZT",
      price: product.price,
      priceValidUntil: new Date(new Date().setFullYear(new Date().getFullYear() + 1))
        .toISOString()
        .split("T")[0],
      itemCondition:
        product.condition === "Б/У"
          ? "https://schema.org/UsedCondition"
          : "https://schema.org/NewCondition",
      availability: product.inStock
        ? "https://schema.org/InStock"
        : "https://schema.org/OutOfStock",
      seller: {
        "@type": "Organization",
        name: "OnePoint.kz",
        url: baseUrl,
      },
    },
  };

  if (product.rating && product.reviewCount > 0) {
    schemaProduct.aggregateRating = {
      "@type": "AggregateRating",
      ratingValue: Number(product.rating).toFixed(1),
      reviewCount: product.reviewCount,
      bestRating: "5",
      worstRating: "1",
    };
  }

  // Schema.org: Breadcrumbs
  const schemaBreadcrumbs = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: [
      {
        "@type": "ListItem",
        position: 1,
        name: "Главная",
        item: baseUrl,
      },
      {
        "@type": "ListItem",
        position: 2,
        name: "Каталог",
        item: `${baseUrl}/catalog`,
      },
      {
        "@type": "ListItem",
        position: 3,
        name: product.categoryName || "Ноутбуки",
        item: `${baseUrl}/catalog?cat=${product.categorySlug}`,
      },
      {
        "@type": "ListItem",
        position: 4,
        name: product.name,
        item: `${baseUrl}/product/${product.slug}`,
      },
    ],
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(schemaProduct) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(schemaBreadcrumbs) }}
      />
      <Header />

      <div className="page-hero" style={{ padding: "36px 0" }}>
        <div className="wrap">
          <nav className="breadcrumbs" aria-label="Хлебные крошки">
            <Link href="/" prefetch={false}>
              Главная
            </Link>
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" width="14" height="14">
              <path d="M9 18l6-6-6-6" />
            </svg>
            <Link href="/catalog" prefetch={false}>
              Каталог
            </Link>
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" width="14" height="14">
              <path d="M9 18l6-6-6-6" />
            </svg>
            <Link href={`/catalog?cat=${product.categorySlug}`} prefetch={false}>
              {product.categoryName}
            </Link>
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" width="14" height="14">
              <path d="M9 18l6-6-6-6" />
            </svg>
            <span>{product.brand}</span>
          </nav>
        </div>
      </div>

      <section style={{ paddingTop: 32, paddingBottom: 80 }}>
        <div className="wrap">
          {/* ====== HERO SECTION (GALLERY + MAIN INFO) ====== */}
          <ProductHeroSection initialProduct={product} initialWaLink={waLink} />

          {/* ====== TABS ====== */}
          <div style={{ marginTop: 64 }}>
            <ProductTabsInteractive product={product} specs={specs} />
          </div>

          {/* ====== ADVANTAGES OR WHY_BUY ====== */}
          {product.whyBuyText ? (
            <div style={{ marginTop: 32, background: "var(--surface)", borderRadius: 20, padding: 32 }}>
              <h3 style={{ fontSize: 20, fontWeight: 800, marginBottom: 16, margin: 0 }}>
                Почему стоит купить этот ноутбук:
              </h3>
              <div
                style={{ color: "var(--text)", lineHeight: 1.6 }}
                dangerouslySetInnerHTML={{ __html: product.whyBuyText }}
              />
            </div>
          ) : product.advantages && product.advantages.length > 0 ? (
            <div style={{ marginTop: 32, background: "var(--surface)", borderRadius: 20, padding: 32 }}>
              <h3 style={{ fontSize: 20, fontWeight: 800, marginBottom: 16, margin: 0 }}>
                Почему стоит купить этот ноутбук:
              </h3>
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
                {similar.map((p) => (
                  <ProductCard key={p.id} product={p} />
                ))}
              </div>
            </div>
          )}
        </div>
      </section>

      <Footer />
    </>
  );
}
