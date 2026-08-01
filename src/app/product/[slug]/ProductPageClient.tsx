"use client";
import { useState, useEffect } from "react";
import BuyModal from "@/components/BuyModal";
import { trackEvent } from "@/lib/analytics";
import LaptopSVG from "@/components/LaptopSVG";

interface GalleryImage {
  image_url: string;
  alt_text?: string;
  is_main?: boolean;
}

interface Review {
  author_name: string;
  initials?: string;
  rating: number;
  body: string;
  source?: string;
  created_at?: string;
}

interface Props {
  product: { id: number; name: string; price: number; slug: string; sku?: string };
  waLink: string;
}

export default function ProductPageClient({ product, waLink }: Props) {
  const [buyModalOpen, setBuyModalOpen] = useState(false);

  useEffect(() => {
    trackEvent('view_item', {
      content_name: product.name,
      content_id: product.id,
      value: product.price,
      currency: 'KZT'
    });
  }, [product]);

  return (
    <>
      <a 
        href={waLink} 
        target="_blank" 
        rel="noopener noreferrer" 
        className="cta-wa"
        onClick={() => trackEvent('click_whatsapp', { content_name: product.name, content_id: product.id })}
      >
        <svg viewBox="0 0 24 24" fill="currentColor" width="20" height="20">
          <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347z" />
          <path d="M12 0C5.373 0 0 5.373 0 12c0 2.125.556 4.122 1.528 5.855L.057 23.082a1 1 0 0 0 1.224 1.3l5.396-1.416A11.942 11.942 0 0 0 12 24c6.627 0 12-5.373 12-12S18.627 0 12 0zm0 22c-1.896 0-3.665-.522-5.176-1.432l-.361-.217-3.742.981.999-3.648-.235-.374A9.96 9.96 0 0 1 2 12C2 6.477 6.477 2 12 2s10 4.477 10 10-4.477 10-10 10z" />
        </svg>
        Заказать через WhatsApp
      </a>

      <button className="cta-call" onClick={() => setBuyModalOpen(true)}>
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" width="20" height="20">
          <path d="M22 16.9v3a2 2 0 0 1-2.2 2 19.8 19.8 0 0 1-8.6-3.1 19.5 19.5 0 0 1-6-6A19.8 19.8 0 0 1 2.1 4.2 2 2 0 0 1 4.1 2h3a2 2 0 0 1 2 1.7c.1.9.3 1.8.6 2.7a2 2 0 0 1-.5 2.1L8 9.7a16 16 0 0 0 6 6l1.2-1.2a2 2 0 0 1 2.1-.5c.9.3 1.8.5 2.7.6a2 2 0 0 1 1.7 2Z" />
        </svg>
        Заказать звонок
      </button>

      <BuyModal isOpen={buyModalOpen} onClose={() => setBuyModalOpen(false)} product={product} />
    </>
  );
}

/* ─── Product Gallery ─── */
export function ProductGallery({ images, mainImage, productName }: {
  images: GalleryImage[];
  mainImage: string;
  productName: string;
}) {
  const allImages = images.filter((image) => Boolean(image.image_url));
  if (allImages.length === 0 && mainImage) {
    allImages.push({ image_url: mainImage, alt_text: productName, is_main: true });
  }
  const hasImages = allImages.length > 0;

  const [active, setActive] = useState(0);
  const [lightbox, setLightbox] = useState(false);
  const [imageError, setImageError] = useState(false);
  const showImage = hasImages && !imageError;

  const [touchStart, setTouchStart] = useState<number | null>(null);
  const [touchEnd, setTouchEnd] = useState<number | null>(null);
  const minSwipeDistance = 50;

  // Keyboard navigation
  useEffect(() => {
    if (!hasImages || allImages.length <= 1) return;
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === 'ArrowRight') setActive(prev => (prev + 1) % allImages.length);
      if (e.key === 'ArrowLeft') setActive(prev => (prev - 1 + allImages.length) % allImages.length);
    };
    window.addEventListener('keydown', handleKey);
    return () => window.removeEventListener('keydown', handleKey);
  }, [hasImages, allImages.length]);

  const onTouchStart = (e: React.TouchEvent) => {
    setTouchEnd(null);
    setTouchStart(e.targetTouches[0].clientX);
  };

  const onTouchMove = (e: React.TouchEvent) => {
    setTouchEnd(e.targetTouches[0].clientX);
  };

  const onTouchEnd = () => {
    if (!touchStart || !touchEnd) return;
    const distance = touchStart - touchEnd;
    const isLeftSwipe = distance > minSwipeDistance;
    const isRightSwipe = distance < -minSwipeDistance;

    if (isLeftSwipe && allImages.length > 1) {
      setActive((prev) => (prev + 1) % allImages.length);
    } else if (isRightSwipe && allImages.length > 1) {
      setActive((prev) => (prev - 1 + allImages.length) % allImages.length);
    }
  };

  return (
    <>
      <div className="product-gallery">
      {/* Main image */}
        <div
          className="product-gallery__main"
          onClick={() => showImage && setLightbox(true)}
          onTouchStart={onTouchStart}
          onTouchMove={onTouchMove}
          onTouchEnd={onTouchEnd}
          style={{ cursor: showImage ? "zoom-in" : "default", position: "relative", overflow: "hidden", borderRadius: 18, background: "#ffffff", border: "1px solid var(--border)" }}
        >
          {showImage ? (
            <>
              <img
                src={allImages[active]?.image_url}
                alt={allImages[active]?.alt_text || productName}
                style={{
                  width: "100%", height: 380, objectFit: "contain", borderRadius: 18,
                  background: "#ffffff", display: "block", transition: "transform .25s ease, opacity .2s ease"
                }}
                onError={() => setImageError(true)}
              />
              <div style={{
                position: "absolute", top: 14, left: 14,
                background: "rgba(0,0,0,0.6)", backdropFilter: "blur(6px)", color: "#fff",
                padding: "6px 12px", borderRadius: 100, fontSize: 12, fontWeight: 700,
                display: "inline-flex", alignItems: "center", gap: 6, opacity: 0.85
              }}>
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" width="14" height="14"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/><line x1="11" y1="8" x2="11" y2="14"/><line x1="8" y1="11" x2="14" y2="11"/></svg>
                Нажмите для увеличения
              </div>
            </>
          ) : (
            <div className="product-gallery__placeholder" aria-label={`Изображение ${productName} пока не добавлено`}>
              <LaptopSVG color1="#5b2a86" color2="#ff5a1f" size={320} />
              <span>Фотография товара скоро появится</span>
            </div>
          )}
          {showImage && allImages.length > 1 && (
            <span style={{
              position: "absolute", bottom: 14, right: 14,
              background: "rgba(0,0,0,0.65)", color: "#fff", backdropFilter: "blur(4px)",
              padding: "5px 12px", borderRadius: 100, fontSize: 12.5, fontWeight: 800
            }}>
              {active + 1} / {allImages.length}
            </span>
          )}
        </div>

        {/* Thumbnails */}
        {showImage && allImages.length > 1 && (
          <div className="product-gallery__thumbs" style={{ display: "flex", gap: 10, overflowX: "auto", padding: "4px 0", marginTop: 12 }}>
            {allImages.map((img, i) => (
              <button
                key={i}
                onClick={() => { setActive(i); setImageError(false); }}
                style={{
                  border: i === active ? "2.5px solid var(--accent)" : "2px solid #e2e4e9",
                  borderRadius: 12,
                  padding: 3,
                  background: "#ffffff",
                  cursor: "pointer",
                  flexShrink: 0,
                  outline: "none",
                  boxShadow: i === active ? "0 4px 12px rgba(255,90,31,0.25)" : "none",
                  transition: "all .2s ease",
                  transform: i === active ? "scale(1.04)" : "scale(1)"
                }}
              >
                <img
                  src={img.image_url}
                  alt={img.alt_text || productName}
                  style={{ width: 72, height: 72, objectFit: "contain", borderRadius: 9, display: "block" }}
                />
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Lightbox */}
      {lightbox && (
        <div
          onClick={() => setLightbox(false)}
          style={{
            position: "fixed", inset: 0, background: "rgba(0,0,0,0.94)", backdropFilter: "blur(10px)",
            zIndex: 99999, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center",
            padding: 20
          }}
        >
          <button onClick={() => setLightbox(false)} style={{
            position: "absolute", top: 20, right: 28, background: "rgba(255,255,255,0.15)", border: "none",
            color: "#fff", width: 44, height: 44, borderRadius: "50%", fontSize: 24, cursor: "pointer",
            display: "flex", alignItems: "center", justifyContent: "center", zIndex: 100000
          }}>✕</button>

          <div style={{ position: "relative", maxWidth: "92vw", maxHeight: "78vh", display: "flex", alignItems: "center", justifyContent: "center" }} onClick={(e) => e.stopPropagation()}>
            <img
              src={allImages[active]?.image_url}
              alt={productName}
              style={{ maxWidth: "100%", maxHeight: "78vh", objectFit: "contain", borderRadius: 16, boxShadow: "0 20px 50px rgba(0,0,0,0.5)" }}
            />
          </div>

          {/* Lightbox Thumbnails Bottom Bar */}
          {allImages.length > 1 && (
            <div style={{ display: "flex", gap: 8, marginTop: 20, overflowX: "auto", maxWidth: "90vw", padding: "8px 0" }} onClick={(e) => e.stopPropagation()}>
              {allImages.map((img, i) => (
                <img
                  key={i}
                  src={img.image_url}
                  alt=""
                  onClick={() => setActive(i)}
                  style={{
                    width: 56, height: 56, objectFit: "contain", borderRadius: 10, background: "#fff",
                    border: i === active ? "3px solid #ff5a1f" : "2px solid rgba(255,255,255,0.3)",
                    cursor: "pointer", opacity: i === active ? 1 : 0.6, transition: "all .2s"
                  }}
                />
              ))}
            </div>
          )}

          {allImages.length > 1 && (
            <>
              <button onClick={(e) => { e.stopPropagation(); setActive(i => (i - 1 + allImages.length) % allImages.length); }} style={{
                position: "absolute", left: 24, top: "50%", transform: "translateY(-50%)",
                background: "rgba(255,255,255,0.2)", border: "none", color: "#fff",
                width: 52, height: 52, borderRadius: "50%", fontSize: 28, cursor: "pointer",
                display: "flex", alignItems: "center", justifyContent: "center"
              }}>‹</button>
              <button onClick={(e) => { e.stopPropagation(); setActive(i => (i + 1) % allImages.length); }} style={{
                position: "absolute", right: 24, top: "50%", transform: "translateY(-50%)",
                background: "rgba(255,255,255,0.2)", border: "none", color: "#fff",
                width: 52, height: 52, borderRadius: "50%", fontSize: 28, cursor: "pointer",
                display: "flex", alignItems: "center", justifyContent: "center"
              }}>›</button>
            </>
          )}
        </div>
      )}
    </>
  );
}

/* ─── Product Tabs ─── */
export function ProductTabsInteractive({ product, specs }: {
  product: any;
  specs: [string, string][];
}) {
  const [activeTab, setActiveTab] = useState<"specs" | "desc" | "equipment">("specs");


  return (
    <div>
      <div style={{ borderBottom: "2px solid var(--border)", marginBottom: 32, display: "flex", gap: 8, overflowX: "auto" }}>
        {[
          { key: "specs", label: "Характеристики" },
          { key: "desc", label: "Описание" },
          { key: "equipment", label: "Комплектация" },

        ].map((t) => (
          <button
            key={t.key}
            onClick={() => setActiveTab(t.key as any)}
            style={{
              padding: "14px 20px",
              fontWeight: 700,
              fontSize: 15,
              color: activeTab === t.key ? "var(--accent)" : "var(--text-muted)",
              borderBottom: activeTab === t.key ? "2px solid var(--accent)" : "2px solid transparent",
              marginBottom: -2,
              whiteSpace: "nowrap",
              cursor: "pointer",
              background: "none",
              borderLeft: "none",
              borderRight: "none",
              borderTop: "none"
            }}
          >
            {t.label}
          </button>
        ))}
      </div>

      {activeTab === "specs" && (
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
      )}

      {activeTab === "desc" && (
        <div style={{ background: "var(--surface)", borderRadius: 20, padding: 32 }}>
          <h3 style={{ fontSize: 20, fontWeight: 800, marginBottom: 16, margin: 0 }}>О товаре</h3>
          {product.description ? (
            <div 
              style={{ color: "var(--text)", lineHeight: 1.6 }} 
              dangerouslySetInnerHTML={{ __html: product.description }} 
            />
          ) : (
            <p style={{ color: "var(--text)", marginBottom: 16 }}>
              {product.shortDescription || "Подробное описание готовит наш технический отдел."}
            </p>
          )}
          <div style={{ display: "flex", flexWrap: "wrap", gap: 12, marginTop: 20 }}>
            <span style={{ background: "#fff", border: "1px solid var(--border)", padding: "8px 16px", borderRadius: 100, fontSize: 13, fontWeight: 600 }}>100% Оригинал</span>
            <span style={{ background: "#fff", border: "1px solid var(--border)", padding: "8px 16px", borderRadius: 100, fontSize: 13, fontWeight: 600 }}>Заводская пломба</span>
            <span style={{ background: "#fff", border: "1px solid var(--border)", padding: "8px 16px", borderRadius: 100, fontSize: 13, fontWeight: 600 }}>Официальная сублицензия</span>
          </div>
        </div>
      )}

      {activeTab === "equipment" && (
        <div style={{ background: "var(--surface)", borderRadius: 20, padding: 32 }}>
          <h3 style={{ fontSize: 20, fontWeight: 800, marginBottom: 18 }}>Что входит в комплект</h3>
          {(() => {
            const list = product.equipment 
              ? product.equipment.split("\n").map((item: string) => item.trim()).filter(Boolean)
              : [
                  "Ноутбук " + product.name,
                  "Оригинальное зарядное устройство и кабель питания",
                  "Гарантийный талон и техническая документация",
                  "Фирменная заводская упаковка с защитными демпферами"
                ];
            return (
              <ul style={{ display: "flex", flexDirection: "column", gap: 14, listStyle: "none", padding: 0 }}>
                {list.map((item: string, index: number) => (
                  <li key={index} style={{ display: "flex", alignItems: "center", gap: 12, fontSize: 15, fontWeight: 600 }}>
                    <span style={{ width: 24, height: 24, borderRadius: "50%", background: "var(--success-tint)", color: "var(--success)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 13, fontWeight: 800 }}>✓</span>
                    {item}
                  </li>
                ))}
              </ul>
            );
          })()}
        </div>
      )}


    </div>
  );
}
