"use client";
import { useEffect, useState } from "react";
import Link from "next/link";

interface Slide {
  id: number;
  image_url: string;
  title?: string;
  subtitle?: string;
  link_url?: string;
  button_text?: string;
  sort_order: number;
  is_active: number;
}

export default function HomeHeroSlider() {
  const [slides, setSlides] = useState<Slide[]>([]);
  const [current, setCurrent] = useState(0);

  useEffect(() => {
    fetch("https://api.onepoint.kz/api/products.php?hero_slides=1")
      .then((res) => res.json())
      .then((data) => {
        if (Array.isArray(data.slides)) {
          setSlides(data.slides);
        }
      })
      .catch((e) => console.error("Error loading slides", e));
  }, []);

  useEffect(() => {
    if (slides.length <= 1) return;
    const t = setInterval(() => {
      setCurrent((c) => (c + 1) % slides.length);
    }, 6000);
    return () => clearInterval(t);
  }, [slides]);

  if (slides.length === 0) {
    // Default static slide fallback
    return (
      <div style={{ position: "relative", width: "100%", borderRadius: 28, overflow: "hidden", display: "flex", justifyContent: "center", alignItems: "center" }}>
        <img
          src="/hero-laptop.png"
          alt="Ноутбуки"
          style={{
            width: "100%",
            maxHeight: 520,
            objectFit: "cover",
            borderRadius: 28,
            filter: "drop-shadow(0 20px 40px rgba(0,0,0,.3))"
          }}
          onError={(e) => { e.currentTarget.style.display = "none"; }}
        />
      </div>
    );
  }

  return (
    <div style={{ position: "relative", width: "100%", borderRadius: 28, overflow: "hidden" }}>
      {slides.map((s, idx) => {
        const isCurrent = idx === current;
        return (
            <div key={s.id} style={{ display: isCurrent ? "flex" : "none", justifyContent: "center", alignItems: "center" }}>
              <img
                src={s.image_url}
                alt={s.title || "Слайд"}
                style={{
                  width: "100%",
                  maxHeight: 520,
                  objectFit: "cover",
                  borderRadius: 28,
                  filter: "drop-shadow(0 20px 40px rgba(0,0,0,.3))"
                }}
              />
            </div>
        );
      })}
      {slides.length > 1 && (
        <div style={{ position: "absolute", bottom: 20, left: 64, display: "flex", gap: 8, zIndex: 10 }}>
          {slides.map((_, idx) => (
            <button
              key={idx}
              onClick={() => setCurrent(idx)}
              style={{
                width: current === idx ? 24 : 8,
                height: 8,
                borderRadius: 4,
                background: current === idx ? "var(--accent)" : "rgba(255,255,255,.3)",
                transition: "all .3s ease"
              }}
            />
          ))}
        </div>
      )}
    </div>
  );
}
