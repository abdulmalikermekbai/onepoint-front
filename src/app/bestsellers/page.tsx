"use client";
import { useState, useEffect } from "react";
import Link from "next/link";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import ProductCard from "@/components/ProductCard";
import { fetchLiveProducts, fetchLiveProductsByFlag, Product } from "@/lib/data";

export default function BestsellersPage() {
  const [hitProducts, setHitProducts] = useState<Product[]>([]);
  const [otherProducts, setOtherProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([
      fetchLiveProductsByFlag("is_hit"),
      fetchLiveProducts(),
    ]).then(([hits, all]) => {
      if (hits.length > 0) {
        setHitProducts(hits);
        setOtherProducts(all.filter(p => !p.isHit).slice(0, 4));
      } else {
        setHitProducts(all.slice(0, 8));
        setOtherProducts(all.slice(8, 12));
      }
      setLoading(false);
    }).catch(() => {
      setLoading(false);
    });
  }, []);

  return (
    <>
      <Header />
      <div className="page-hero">
        <div className="wrap">
          <div className="breadcrumbs">
            <Link href="/" prefetch={false}>Главная</Link>
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" width="14" height="14"><path d="M9 18l6-6-6-6"/></svg>
            <span>Хиты продаж</span>
          </div>
          <h1>Хиты продаж</h1>
          <p>Самые популярные ноутбуки, которые выбирают покупатели OnePoint каждый день.</p>
        </div>
      </div>

      <section>
        <div className="wrap">
          {/* Top-3 podium */}
          {hitProducts.length > 0 && (
            <div className="bestsellers-podium" style={{ display: "grid", gridTemplateColumns: "1fr 1.2fr 1fr", gap: 20, marginBottom: 60, alignItems: "flex-end" }}>
              {hitProducts.slice(0, 3).map((p, i) => (
                <div key={p.id} style={{
                  background: i === 0 ? "linear-gradient(135deg,#FFD700,#FFA500)" : i === 1 ? "linear-gradient(135deg,#E8E8E8,#C0C0C0)" : "linear-gradient(135deg,#CD7F32,#A0522D)",
                  borderRadius: 20,
                  padding: `${32 + (1 - i) * 16}px 24px 28px`,
                  textAlign: "center",
                  color: i === 0 ? "#5a3000" : "#333",
                }}>
                  <div style={{ fontSize: 40, fontWeight: 900, opacity: .4, lineHeight: 1 }}>#{i + 1}</div>
                  <div style={{ fontWeight: 700, fontSize: 15, margin: "8px 0 4px", lineHeight: 1.3 }}>{p.brand} {p.series || p.name}</div>
                  <div style={{ fontSize: 13, opacity: .7, marginBottom: 12, display: "flex", alignItems: "center", justifyContent: "center", gap: 4 }}>
                    <svg viewBox="0 0 24 24" fill="#f59e0b" stroke="#f59e0b" strokeWidth="1" width="13" height="13"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/></svg>
                    {p.rating} · {p.reviewCount} отзывов
                  </div>
                  <Link href={`/product/${p.slug}`} prefetch={false} className="btn btn-dark btn-xs" style={{ display: "inline-flex" }}>Подробнее</Link>
                </div>
              ))}
            </div>
          )}

          <div className="section-head">
            <div>
              <div className="eyebrow">Все хиты</div>
              <h2 className="section-title">Популярные модели</h2>
            </div>
          </div>

          {loading ? (
            <div style={{ padding: "40px 0", textTransform: "uppercase", color: "var(--text-muted)", fontSize: 14 }}>Загрузка хитов продаж...</div>
          ) : hitProducts.length === 0 ? (
            <div style={{ padding: "40px 0", color: "var(--text-muted)", fontSize: 14 }}>Нет товаров в этой категории.</div>
          ) : (
            <div className="product-grid">
              {hitProducts.map(p => <ProductCard key={p.id} product={p} />)}
            </div>
          )}

          {/* Also popular */}
          {otherProducts.length > 0 && (
            <div style={{ marginTop: 64 }}>
              <div className="section-head">
                <div>
                  <div className="eyebrow">Также популярно</div>
                  <h2 className="section-title">Выбор наших покупателей</h2>
                </div>
              </div>
              <div className="product-grid">
                {otherProducts.map(p => <ProductCard key={p.id} product={p} />)}
              </div>
            </div>
          )}
        </div>
      </section>

      <Footer />
    </>
  );
}
