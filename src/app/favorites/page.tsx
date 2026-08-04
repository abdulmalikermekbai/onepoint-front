"use client";
import { useEffect, useState } from "react";
import Link from "next/link";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import ProductCard from "@/components/ProductCard";
import { fetchLiveProducts, Product } from "@/lib/data";

export default function FavoritesPage() {
  const [favorites, setFavorites] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadFavorites = async () => {
      try {
        const favIds = JSON.parse(localStorage.getItem("onepoint-favorites") || "[]");
        if (favIds.length === 0) {
          setFavorites([]);
          setLoading(false);
          return;
        }
        
        const allProducts = await fetchLiveProducts();
        const favProducts = allProducts.filter(p => favIds.includes(p.id));
        setFavorites(favProducts);
      } catch (e) {
        console.error(e);
      } finally {
        setLoading(false);
      }
    };

    loadFavorites();

    const handleUpdate = () => {
      loadFavorites();
    };

    window.addEventListener("favorites-updated", handleUpdate);
    return () => window.removeEventListener("favorites-updated", handleUpdate);
  }, []);

  return (
    <>
      <Header />
      <div className="page-hero">
        <div className="wrap">
          <div className="breadcrumbs">
            <Link href="/">Главная</Link>
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" width="14" height="14"><path d="M9 18l6-6-6-6"/></svg>
            <span>Избранное</span>
          </div>
          <h1>Избранное</h1>
          <p>Ноутбуки, которые вы добавили в список желаний.</p>
        </div>
      </div>

      <section style={{ minHeight: "50vh" }}>
        <div className="wrap">
          {loading ? (
            <div style={{ padding: "40px 0", textTransform: "uppercase", color: "var(--text-muted)", fontSize: 14 }}>Загрузка...</div>
          ) : favorites.length === 0 ? (
            <div style={{ padding: "60px 0", textAlign: "center" }}>
              <div style={{ fontSize: 48, marginBottom: 16 }}>💔</div>
              <h2 style={{ fontSize: 24, fontWeight: 700, marginBottom: 12 }}>В избранном пока пусто</h2>
              <p style={{ color: "var(--text-muted)", marginBottom: 24 }}>Добавляйте товары в избранное, чтобы не потерять их.</p>
              <Link href="/catalog" className="btn btn-primary" style={{ display: "inline-flex" }}>Перейти в каталог</Link>
            </div>
          ) : (
            <div className="product-grid">
              {favorites.map(p => <ProductCard key={p.id} product={p} />)}
            </div>
          )}
        </div>
      </section>

      <Footer />
    </>
  );
}
