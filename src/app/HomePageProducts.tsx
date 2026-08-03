"use client";
import { useEffect, useState } from "react";
import ProductCard from "@/components/ProductCard";
import { fetchLiveProducts, fetchLiveProductsByFlag, Product } from "@/lib/data";

export function HitProductsGrid() {
  const [hits, setHits] = useState<Product[]>([]);

  useEffect(() => {
    fetchLiveProductsByFlag("is_hit").then(featured => {
      if (featured.length > 0) {
        setHits(featured.slice(0, 8));
      } else {
        // Fallback
        fetchLiveProducts().then(list => setHits(list.slice(0, 8)));
      }
    });
  }, []);

  if (hits.length === 0) return <p className="products-empty">Товары появятся здесь сразу после загрузки каталога.</p>;

  return (
    <div className="product-grid reveal">
      {hits.map((p) => (
        <ProductCard key={p.id} product={p} />
      ))}
    </div>
  );
}

export function NewProductsGrid() {
  const [news, setNews] = useState<Product[]>([]);

  useEffect(() => {
    fetchLiveProductsByFlag("is_new").then(featured => {
      if (featured.length > 0) {
        setNews(featured.slice(0, 4));
      } else {
        // Fallback
        fetchLiveProducts().then(list => setNews(list.slice(0, 4)));
      }
    });
  }, []);

  if (news.length === 0) return <p className="products-empty">Товары появятся здесь сразу после загрузки каталога.</p>;

  return (
    <div className="product-grid reveal">
      {news.map((p) => (
        <ProductCard key={p.id} product={p} />
      ))}
    </div>
  );
}
