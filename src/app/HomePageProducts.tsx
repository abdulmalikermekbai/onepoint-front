"use client";
import { useEffect, useState } from "react";
import ProductCard from "@/components/ProductCard";
import { fetchLiveProductsByFlag, Product } from "@/lib/data";

export function HitProductsGrid() {
  const [hits, setHits] = useState<Product[]>([]);

  useEffect(() => {
    fetchLiveProductsByFlag("is_hit").then(list => {
      setHits(list.slice(0, 8));
    });
  }, []);

  if (hits.length === 0) return null;

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
    fetchLiveProductsByFlag("is_new").then(list => {
      setNews(list.slice(0, 4));
    });
  }, []);

  if (news.length === 0) return null;

  return (
    <div className="product-grid reveal">
      {news.map((p) => (
        <ProductCard key={p.id} product={p} />
      ))}
    </div>
  );
}
