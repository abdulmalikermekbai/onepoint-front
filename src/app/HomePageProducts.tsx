"use client";
import { useEffect, useState } from "react";
import ProductCard from "@/components/ProductCard";
import { fetchLiveProducts, Product } from "@/lib/data";

export function HitProductsGrid() {
  const [hits, setHits] = useState<Product[]>([]);

  useEffect(() => {
    fetchLiveProducts().then(list => {
      const featured = list.filter(product => product.isHit);
      setHits((featured.length ? featured : list).slice(0, 8));
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
    fetchLiveProducts().then(list => {
      const featured = list.filter(product => product.isNew);
      setNews((featured.length ? featured : list).slice(0, 4));
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
