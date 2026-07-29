"use client";
import { useEffect } from "react";

export default function HomeClient() {
  useEffect(() => {
    // Reveal on scroll
    const revealEls = document.querySelectorAll(".reveal");
    const io = new IntersectionObserver(
      (entries) => {
        entries.forEach((e) => {
          if (e.isIntersecting) {
            e.target.classList.add("in");
            io.unobserve(e.target);
          }
        });
      },
      { threshold: 0.1 }
    );
    revealEls.forEach((el) => io.observe(el));
    return () => io.disconnect();
  }, []);

  return null;
}
