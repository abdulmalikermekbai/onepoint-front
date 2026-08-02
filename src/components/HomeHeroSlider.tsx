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

  const [touchStart, setTouchStart] = useState<number | null>(null);
  const [touchEnd, setTouchEnd] = useState<number | null>(null);
  const minSwipeDistance = 50;

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (slides.length <= 1) return;
      if (e.key === "ArrowRight") {
        setCurrent((c) => (c + 1) % slides.length);
      } else if (e.key === "ArrowLeft") {
        setCurrent((c) => (c - 1 + slides.length) % slides.length);
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [slides]);

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

    if (isLeftSwipe && slides.length > 1) {
      setCurrent((c) => (c + 1) % slides.length);
    } else if (isRightSwipe && slides.length > 1) {
      setCurrent((c) => (c - 1 + slides.length) % slides.length);
    }
  };

  if (slides.length === 0) {
    // Return empty sized box that collapses instead of showing error placeholders during fetch
    return (
      <div style={{ position: "relative", width: "100%", aspectRatio: "16 / 6.1", borderRadius: 28, overflow: "hidden", display: "flex", justifyContent: "center", alignItems: "center" }}>
        {/* Empty container with height mapping - no placeholder icon */}
      </div>
    );
  }

  return (
    <div 
      onTouchStart={onTouchStart}
      onTouchMove={onTouchMove}
      onTouchEnd={onTouchEnd}
      style={{ position: "relative", width: "100%", borderRadius: 28, overflow: "hidden" }}
    >
      {slides.map((s, idx) => {
        const isCurrent = idx === current;
        return (
          <div key={s.id} style={{ display: isCurrent ? "flex" : "none", justifyContent: "center", alignItems: "center", position: "relative" }}>
            {s.link_url ? (
              <Link href={s.link_url} style={{ display: "block", width: "100%", height: "100%" }}>
                <img
                  src={s.image_url}
                  alt={s.title || "Слайд"}
                  className="hero-slider-img"
                  style={{
                    width: "100%",
                    maxHeight: 520,
                    objectFit: "contain",
                    borderRadius: 28,
                    filter: "drop-shadow(0 20px 40px rgba(0,0,0,.3))"
                  }}
                />
              </Link>
            ) : (
              <img
                src={s.image_url}
                alt={s.title || "Слайд"}
                style={{
                  width: "100%",
                  maxHeight: 520,
                  objectFit: "contain",
                  borderRadius: 28,
                  filter: "drop-shadow(0 20px 40px rgba(0,0,0,.3))"
                }}
              />
            )}
          </div>
        );
      })}

      {/* Navigation Arrows */}
      {slides.length > 1 && (
        <>
          <button
            onClick={() => setCurrent((c) => (c - 1 + slides.length) % slides.length)}
            style={{
              position: "absolute",
              left: 20,
              top: "50%",
              transform: "translateY(-50%)",
              background: "rgba(0,0,0,0.4)",
              color: "#fff",
              border: "none",
              borderRadius: "50%",
              width: 44,
              height: 44,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              cursor: "pointer",
              zIndex: 10,
              transition: "background 0.2s"
            }}
            onMouseEnter={(e) => e.currentTarget.style.background = "rgba(0,0,0,0.7)"}
            onMouseLeave={(e) => e.currentTarget.style.background = "rgba(0,0,0,0.4)"}
          >
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" width="20" height="20">
              <path d="M15 18l-6-6 6-6" />
            </svg>
          </button>
          <button
            onClick={() => setCurrent((c) => (c + 1) % slides.length)}
            style={{
              position: "absolute",
              right: 20,
              top: "50%",
              transform: "translateY(-50%)",
              background: "rgba(0,0,0,0.4)",
              color: "#fff",
              border: "none",
              borderRadius: "50%",
              width: 44,
              height: 44,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              cursor: "pointer",
              zIndex: 10,
              transition: "background 0.2s"
            }}
            onMouseEnter={(e) => e.currentTarget.style.background = "rgba(0,0,0,0.7)"}
            onMouseLeave={(e) => e.currentTarget.style.background = "rgba(0,0,0,0.4)"}
          >
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" width="20" height="20">
              <path d="M9 18l6-6-6-6" />
            </svg>
          </button>
        </>
      )}

      {slides.length > 1 && (
        <div style={{ position: "absolute", bottom: 20, left: "50%", transform: "translateX(-50%)", display: "flex", gap: 8, zIndex: 10 }}>
          {slides.map((_, idx) => (
            <button
              key={idx}
              onClick={() => setCurrent(idx)}
              style={{
                width: current === idx ? 24 : 8,
                height: 8,
                borderRadius: 4,
                background: current === idx ? "var(--accent)" : "rgba(255,255,255,.4)",
                transition: "all .3s ease"
              }}
            />
          ))}
        </div>
      )}
    </div>
  );
}
