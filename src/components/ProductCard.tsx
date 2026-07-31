"use client";
import Link from "next/link";
import { useState } from "react";
import LaptopSVG from "./LaptopSVG";
import BuyModal from "./BuyModal";
import type { Product } from "@/lib/data";
import { formatPrice, formatGpu } from "@/lib/data";

interface ProductCardProps {
  product: Product;
  onToast?: (msg: string) => void;
}

export default function ProductCard({ product, onToast }: ProductCardProps) {
  const [fav, setFav] = useState(false);
  const [buyOpen, setBuyOpen] = useState(false);
  const [imageLoadError, setImageLoadError] = useState(false);
  const [activeImg, setActiveImg] = useState(0);

  const gallery = product.images && product.images.length > 0 ? product.images : (product.image ? [product.image] : []);

  const waLink = `https://wa.me/77075511979?text=Здравствуйте!%20Хочу%20заказать:%20${encodeURIComponent(product.name)}%20за%20${encodeURIComponent(formatPrice(product.price))}`;

  return (
    <>
      <div className="product-card">
        {/* Media */}
        <div className="product-media" style={{ background: product.bgGradient }}>
          <div className="media-top-row">
            <div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
              {Boolean(product.discountPercent) && (
                <span className="discount-badge">-{product.discountPercent}%</span>
              )}
              {product.isNew && <span className="new-badge">Новинка</span>}
              {product.isHit && !product.isNew && <span className="hit-badge">Хит</span>}
            </div>
            <button
              className={`fav-btn${fav ? " active" : ""}`}
              onClick={() => {
                setFav(!fav);
                onToast?.(fav ? "Убрано из избранного" : "Добавлено в избранное");
              }}
              aria-label="В избранное"
            >
              <svg viewBox="0 0 24 24" fill={fav ? "currentColor" : "none"} stroke="currentColor" strokeWidth="2">
                <path d="M20.8 4.6a5.5 5.5 0 0 0-7.8 0L12 5.6l-1-1a5.5 5.5 0 1 0-7.8 7.8l1 1L12 21l7.8-7.6 1-1a5.5 5.5 0 0 0 0-7.8Z" />
              </svg>
            </button>
          </div>
          {gallery.length > 0 && !imageLoadError ? (
            <div style={{ position: "relative", width: "100%", paddingBottom: gallery.length > 1 ? 16 : 0 }}>
              <img
                className="product-photo"
                src={gallery[activeImg]}
                alt={product.name}
                loading="lazy"
                style={{ mixBlendMode: "normal" }}
                onError={() => setImageLoadError(true)}
              />
              {gallery.length > 1 && (
                <div style={{ display: "flex", justifyContent: "center", gap: 6, position: "absolute", bottom: -4, left: 0, right: 0 }}>
                  {gallery.slice(0, 5).map((_, i) => (
                    <button
                      key={i}
                      onMouseEnter={() => setActiveImg(i)}
                      onClick={(e) => { e.preventDefault(); setActiveImg(i); }}
                      style={{
                        width: activeImg === i ? 16 : 6,
                        height: 6,
                        borderRadius: 6,
                        background: activeImg === i ? "var(--accent)" : "rgba(0,0,0,0.2)",
                        border: "none",
                        cursor: "pointer",
                        padding: 0,
                        transition: "all 0.2s ease"
                      }}
                      aria-label={`Slide ${i + 1}`}
                    />
                  ))}
                </div>
              )}
            </div>
          ) : (
            <LaptopSVG color1={product.svgColor1} color2={product.svgColor2} size={220} />
          )}
        </div>

        {/* Body */}
        <div className="product-body">
          <div>
            <div className="product-brand">{product.brand} · {product.categoryName}</div>
            <Link href={`/product/${product.slug}`}>
              <h3 className="product-name" style={{ cursor: "pointer", transition: "color .2s" }}
                onMouseEnter={e => (e.currentTarget.style.color = "var(--accent)")}
                onMouseLeave={e => (e.currentTarget.style.color = "")}
              >{product.name}</h3>
            </Link>
          </div>

          <div className="rating-row">
            <span className="stars">{"★".repeat(Math.round(product.rating))}</span>
            <span className="rating-num">{product.rating}</span>
            <span className="rating-count">({product.reviewCount} отзывов)</span>
          </div>

          <div className="spec-grid">
            <div className="spec-item">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" width="15" height="15">
                <rect x="6" y="6" width="12" height="12" rx="2" />
                <path d="M9 2v3M15 2v3M9 19v3M15 19v3M2 9h3M2 15h3M19 9h3M19 15h3" />
              </svg>
              <div>
                <div className="spec-label">Процессор</div>
                <div className="spec-val">{product.processor?.split(" ").slice(0, 3).join(" ")}</div>
              </div>
            </div>
            <div className="spec-item">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" width="15" height="15">
                <rect x="3" y="7" width="18" height="10" rx="2" />
                <path d="M7 17v2M17 17v2" />
              </svg>
              <div>
                <div className="spec-label">Видеокарта</div>
                <div className="spec-val">{formatGpu(product.gpu)}</div>
              </div>
            </div>
            <div className="spec-item">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" width="15" height="15">
                <path d="M12 2v20M2 12h20" />
              </svg>
              <div>
                <div className="spec-label">Память</div>
                <div className="spec-val">{product.ram}</div>
              </div>
            </div>
            <div className="spec-item">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" width="15" height="15">
                <rect x="3" y="3" width="18" height="18" rx="3" />
                <path d="M9 9h6v6H9z" />
              </svg>
              <div>
                <div className="spec-label">Накопитель</div>
                <div className="spec-val">{product.storage}</div>
              </div>
            </div>
          </div>

          <div className={`stock-row ${product.inStock ? "stock-in" : "stock-order"}`}>
            <span className="stock-dot" />
            {product.inStock ? "В наличии" : "Под заказ"}
          </div>

          <div style={{ marginTop: "auto" }}>
            {product.oldPrice && (
              <div className="price-old">{formatPrice(product.oldPrice)}</div>
            )}
            <div style={{ display: "flex", alignItems: "flex-end", justifyContent: "space-between", gap: 8 }}>
              <div>
                <div className="price-new">{formatPrice(product.price)}</div>
                {product.saving && (
                  <div className="price-saving">Экономия {formatPrice(product.saving)}</div>
                )}
              </div>
            </div>
          </div>

          <button className="buy-btn" style={{ width: "100%" }} onClick={() => setBuyOpen(true)}>
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" width="16" height="16">
              <circle cx="9" cy="21" r="1" />
              <circle cx="20" cy="21" r="1" />
              <path d="M1 1h4l2.7 13.4a2 2 0 0 0 2 1.6h9.7a2 2 0 0 0 2-1.6L23 6H6" />
            </svg>
            Купить
          </button>

          <a href={waLink} target="_blank" rel="noopener noreferrer" className="wa-btn-card">
            <svg viewBox="0 0 24 24" fill="currentColor" width="16" height="16">
              <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347z" />
              <path d="M12 0C5.373 0 0 5.373 0 12c0 2.125.556 4.122 1.528 5.855L.057 23.082a1 1 0 0 0 1.224 1.3l5.396-1.416A11.942 11.942 0 0 0 12 24c6.627 0 12-5.373 12-12S18.627 0 12 0zm0 22c-1.896 0-3.665-.522-5.176-1.432l-.361-.217-3.742.981.999-3.648-.235-.374A9.96 9.96 0 0 1 2 12C2 6.477 6.477 2 12 2s10 4.477 10 10-4.477 10-10 10z" />
            </svg>
            Заказать в WhatsApp
          </a>
        </div>
      </div>

      <BuyModal isOpen={buyOpen} onClose={() => setBuyOpen(false)} product={product} />
    </>
  );
}
