"use client";
import { useState, useRef, useEffect, TouchEvent } from "react";
import LaptopSVG from "./LaptopSVG";

interface ProductGalleryProps {
  images?: string[];
  productName: string;
  svgColor1?: string;
  svgColor2?: string;
  bgGradient?: string;
}

export default function ProductGallery({
  images = [],
  productName,
  svgColor1 = "#FF5A1F",
  svgColor2 = "#3B82F6",
  bgGradient = "radial-gradient(circle at 50% 50%, rgba(255, 90, 31, 0.08), transparent 70%)",
}: ProductGalleryProps) {
  // If images array is empty or has items, fallback to SVG views if no URLs
  const displayImages = images.length > 0 ? images : ["svg-fallback"];

  const [activeIndex, setActiveIndex] = useState(0);
  const [lightboxOpen, setLightboxOpen] = useState(false);
  const [touchStart, setTouchStart] = useState<number | null>(null);
  const [touchEnd, setTouchEnd] = useState<number | null>(null);

  // Swipe threshold
  const minSwipeDistance = 50;

  const onTouchStart = (e: TouchEvent) => {
    setTouchEnd(null);
    setTouchStart(e.targetTouches[0].clientX);
  };

  const onTouchMove = (e: TouchEvent) => {
    setTouchEnd(e.targetTouches[0].clientX);
  };

  const onTouchEnd = () => {
    if (!touchStart || !touchEnd) return;
    const distance = touchStart - touchEnd;
    const isLeftSwipe = distance > minSwipeDistance;
    const isRightSwipe = distance < -minSwipeDistance;

    if (isLeftSwipe) {
      nextImage();
    } else if (isRightSwipe) {
      prevImage();
    }
  };

  const nextImage = () => {
    setActiveIndex((prev) => (prev + 1) % displayImages.length);
  };

  const prevImage = () => {
    setActiveIndex((prev) => (prev - 1 + displayImages.length) % displayImages.length);
  };

  useEffect(() => {
    if (!lightboxOpen) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        setLightboxOpen(false);
      } else if (e.key === "ArrowRight") {
        nextImage();
      } else if (e.key === "ArrowLeft") {
        prevImage();
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [lightboxOpen, displayImages.length]);

  const currentImg = displayImages[activeIndex];

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
      {/* Main Image Stage */}
      <div
        className="gallery-main-stage"
        onTouchStart={onTouchStart}
        onTouchMove={onTouchMove}
        onTouchEnd={onTouchEnd}
        style={{
          position: "relative",
          width: "100%",
          aspectRatio: "4 / 3",
          background: bgGradient,
          borderRadius: 24,
          overflow: "hidden",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          cursor: "default",
          border: "1px solid var(--border)",
          transition: "transform .25s ease, box-shadow .25s ease",
        }}
      >
        <div
          key={activeIndex}
          style={{
            width: "100%",
            height: "100%",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            padding: 24,
            animation: "fadeIn .3s cubic-bezier(0.16, 1, 0.3, 1)",
          }}
        >
          {currentImg && currentImg !== "svg-fallback" ? (
            <img
              src={currentImg}
              alt={productName}
              style={{
                maxWidth: "100%",
                maxHeight: "100%",
                objectFit: "contain",
                filter: "drop-shadow(0 16px 32px rgba(0,0,0,0.15))",
              }}
              loading="lazy"
            />
          ) : (
            <LaptopSVG color1={svgColor1} color2={svgColor2} size={360} />
          )}
        </div>

        {/* Hover zoom hint icon */}
        <div
          style={{
            position: "absolute",
            bottom: 16,
            right: 16,
            background: "rgba(255, 255, 255, 0.85)",
            backdropFilter: "blur(4px)",
            borderRadius: "50%",
            width: 38,
            height: 38,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            color: "var(--text)",
            boxShadow: "0 4px 12px rgba(0,0,0,0.1)",
          }}
        >
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" width="20" height="20">
            <path d="M15 3h6v6M9 21H3v-6M21 3l-7 7M3 21l7-7" />
          </svg>
        </div>

        {/* Arrows for multi-image desktop view */}
        {displayImages.length > 1 && (
          <>
            <button
              onClick={(e) => {
                e.stopPropagation();
                prevImage();
              }}
              aria-label="Предыдущее изображение"
              style={{
                position: "absolute",
                left: 12,
                top: "50%",
                transform: "translateY(-50%)",
                background: "rgba(255,255,255,0.9)",
                border: "none",
                borderRadius: "50%",
                width: 40,
                height: 40,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                cursor: "pointer",
                boxShadow: "0 4px 12px rgba(0,0,0,0.12)",
                transition: "all .2s",
              }}
            >
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" width="20" height="20">
                <path d="M15 18l-6-6 6-6" />
              </svg>
            </button>
            <button
              onClick={(e) => {
                e.stopPropagation();
                nextImage();
              }}
              aria-label="Следующее изображение"
              style={{
                position: "absolute",
                right: 12,
                top: "50%",
                transform: "translateY(-50%)",
                background: "rgba(255,255,255,0.9)",
                border: "none",
                borderRadius: "50%",
                width: 40,
                height: 40,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                cursor: "pointer",
                boxShadow: "0 4px 12px rgba(0,0,0,0.12)",
                transition: "all .2s",
              }}
            >
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" width="20" height="20">
                <path d="M9 18l6-6-6-6" />
              </svg>
            </button>
          </>
        )}
      </div>

      {/* Thumbnails list (only shown if displayImages.length > 1) */}
      {displayImages.length > 1 && (
        <div
          style={{
            display: "flex",
            gap: 12,
            overflowX: "auto",
            paddingBottom: 4,
            scrollBehavior: "smooth",
          }}
        >
          {displayImages.map((img, i) => (
            <button
              key={i}
              onClick={() => setActiveIndex(i)}
              style={{
                width: 72,
                height: 72,
                borderRadius: 14,
                border: i === activeIndex ? "2px solid var(--accent)" : "1.5px solid var(--border)",
                background: "var(--surface)",
                padding: 6,
                cursor: "pointer",
                flexShrink: 0,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                overflow: "hidden",
                transition: "all .2s",
                boxShadow: i === activeIndex ? "0 4px 12px rgba(255,90,31,0.2)" : "none",
              }}
            >
              {img !== "svg-fallback" ? (
                <img
                  src={img}
                  alt=""
                  style={{ width: "100%", height: "100%", objectFit: "contain" }}
                  loading="lazy"
                />
              ) : (
                <LaptopSVG color1={svgColor1} color2={svgColor2} size={48} />
              )}
            </button>
          ))}
        </div>
      )}

      {/* Lightbox Modal */}
      {lightboxOpen && (
        <div
          onClick={() => setLightboxOpen(false)}
          style={{
            position: "fixed",
            inset: 0,
            zIndex: 10000,
            background: "rgba(10, 11, 15, 0.92)",
            backdropFilter: "blur(12px)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            padding: 24,
            animation: "fadeIn .25s ease",
          }}
        >
          <button
            onClick={() => setLightboxOpen(false)}
            aria-label="Закрыть"
            style={{
              position: "absolute",
              top: 24,
              right: 24,
              background: "rgba(255,255,255,0.15)",
              border: "none",
              borderRadius: "50%",
              width: 44,
              height: 44,
              color: "#fff",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              cursor: "pointer",
              transition: "background .2s",
            }}
          >
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" width="24" height="24">
              <path d="M18 6 6 18M6 6l12 12" />
            </svg>
          </button>

          {displayImages.length > 1 && (
            <>
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  prevImage();
                }}
                aria-label="Предыдущее"
                style={{
                  position: "absolute",
                  left: 24,
                  top: "50%",
                  transform: "translateY(-50%)",
                  background: "rgba(255,255,255,0.15)",
                  border: "none",
                  borderRadius: "50%",
                  width: 50,
                  height: 50,
                  color: "#fff",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  cursor: "pointer",
                }}
              >
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" width="24" height="24">
                  <path d="M15 18l-6-6 6-6" />
                </svg>
              </button>

              <button
                onClick={(e) => {
                  e.stopPropagation();
                  nextImage();
                }}
                aria-label="Следующее"
                style={{
                  position: "absolute",
                  right: 24,
                  top: "50%",
                  transform: "translateY(-50%)",
                  background: "rgba(255,255,255,0.15)",
                  border: "none",
                  borderRadius: "50%",
                  width: 50,
                  height: 50,
                  color: "#fff",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  cursor: "pointer",
                }}
              >
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" width="24" height="24">
                  <path d="M9 18l6-6-6-6" />
                </svg>
              </button>
            </>
          )}

          <div
            onClick={(e) => e.stopPropagation()}
            style={{
              maxWidth: "90vw",
              maxHeight: "85vh",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            {currentImg && currentImg !== "svg-fallback" ? (
              <img
                src={currentImg}
                alt={productName}
                style={{
                  maxWidth: "100%",
                  maxHeight: "85vh",
                  objectFit: "contain",
                  borderRadius: 16,
                  boxShadow: "0 24px 60px rgba(0,0,0,0.5)",
                }}
              />
            ) : (
              <LaptopSVG color1={svgColor1} color2={svgColor2} size={500} />
            )}
          </div>
        </div>
      )}
    </div>
  );
}
