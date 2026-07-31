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
      <div className="hero-banner">
        <div className="hero-glow" />
        <div className="hero-glow-2" />
        <div className="hero-text reveal">
          <div className="hero-badge">
            <span className="ping" />
            АКЦИИ И НОВИНКИ
          </div>
          <h2 className="hero-title">Ноутбуки OnePoint</h2>
          <p className="hero-desc">
            Оригинальные ноутбуки ведущих мировых брендов с гарантией 1 год и быстрой доставкой по всему Казахстану.
          </p>
          <div className="hero-cta-row">
            <Link href="/catalog" className="btn btn-primary">
              Смотрите каталог
            </Link>
            <a
              href="https://wa.me/77075511979?text=Здравствуйте!%20Заинтересовал%20блок%20главного%20слайда"
              target="_blank"
              rel="noopener noreferrer"
              className="btn btn-green"
            >
              Заказать в WhatsApp
            </a>
          </div>
        </div>
        <div style={{ display: "flex", justifyContent: "center", alignItems: "center" }}>
          <img src="/hero-laptop.png" alt="Ноутбуки" style={{ maxWidth: "100%", maxHeight: 380, objectFit: "contain" }} onError={(e) => { e.currentTarget.style.display = "none"; }} />
        </div>
      </div>
    );
  }

  return (
    <div style={{ position: "relative", width: "100%", borderRadius: 28, overflow: "hidden" }}>
      {slides.map((s, idx) => {
        const isCurrent = idx === current;
        return (
          <div
            key={s.id}
            style={{
              display: isCurrent ? "grid" : "none",
              gridTemplateColumns: "1fr 1fr",
              gap: 32,
              alignItems: "center",
              minHeight: 520,
              padding: "64px 64px",
              background: `radial-gradient(ellipse 900px 600px at 78% 20%, rgba(255,90,31,0.18) 0%, transparent 60%), linear-gradient(135deg, #0d0d11 0%, #151519 55%, #181410 100%)`,
              position: "relative",
              animation: "fadeIn .6s ease-in-out"
            }}
          >
            <div className="hero-glow" />
            <div className="hero-text">
              <div className="hero-badge">
                <span className="ping" />
                АКЦИИ И НОВИНКИ
              </div>
              <h2 style={{ color: "#fff", fontSize: 44, fontWeight: 800, lineHeight: 1.1, letterSpacing: "-.02em", marginBottom: 16 }}>
                {s.title || "Ноутбуки OnePoint"}
              </h2>
              <p style={{ color: "rgba(255,255,255,.7)", fontSize: 16, lineHeight: 1.6, marginBottom: 28, maxWidth: 440 }}>
                {s.subtitle || "Оригинальные ноутбуки ведущих мировых брендов с гарантией 1 год и быстрой доставкой по всему Казахстану."}
              </p>
              <div className="hero-cta-row">
                <Link href={s.link_url || "/catalog"} className="btn btn-primary">
                  {s.button_text || "Смотреть детали"}
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4" width="16" height="16"><path d="M5 12h14M13 6l6 6-6 6"/></svg>
                </Link>
                <a
                  href={`https://wa.me/77075511979?text=${encodeURIComponent("Здравствуйте! Заинтересовал слайд: " + (s.title || "Слайдер OnePoint"))}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="btn btn-green"
                >
                  Заказать в WhatsApp
                </a>
              </div>
            </div>
            <div style={{ display: "flex", justifyContent: "center", alignItems: "center" }}>
              <img
                src={s.image_url}
                alt={s.title || "Слайд"}
                style={{
                  maxWidth: "100%",
                  maxHeight: 380,
                  objectFit: "contain",
                  borderRadius: 12,
                  filter: "drop-shadow(0 20px 40px rgba(0,0,0,.3))"
                }}
              />
            </div>
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
