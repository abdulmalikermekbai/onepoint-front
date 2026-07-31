"use client";
import { useEffect, useState } from "react";
import { fetchSettings } from "@/lib/data";

export function ClientStatsGrid() {
  const [stats, setStats] = useState([
    { num: "100%", label: "Оригинальная техника" },
    { num: "5000+", label: "Довольных клиентов" },
    { num: "5 лет", label: "На рынке Казахстана" },
    { num: "1 год", label: "Гарантия на ноутбуки" },
  ]);

  useEffect(() => {
    fetchSettings().then(res => {
      if (res && Object.keys(res).length > 0) {
        setStats([
          { num: res.stats_1_num || "100%", label: res.stats_1_label || "Оригинальная техника" },
          { num: res.stats_2_num || "5000+", label: res.stats_2_label || "Довольных клиентов" },
          { num: res.stats_3_num || "5 лет", label: res.stats_3_label || "На рынке Казахстана" },
          { num: res.stats_4_num || "1 год", label: res.stats_4_label || "Гарантия на ноутбуки" },
        ]);
      }
    });
  }, []);

  return (
    <div className="stats-grid">
      {stats.map((s, i) => (
        <div key={i}>
          <div className="stat-num" style={{ fontSize: s.num.length > 5 ? 24 : 28 }}>{s.num}</div>
          <div className="stat-label">{s.label}</div>
        </div>
      ))}
    </div>
  );
}

export function ClientAboutStats() {
  const [stats, setStats] = useState([
    { num: "5+", label: "Лет на рынке" },
    { num: "100%", label: "Оригинальная техника" },
    { num: "5000+", label: "Довольных клиентов" },
    { num: "4.9", label: "Рейтинг в 2GIS" },
  ]);

  useEffect(() => {
    fetchSettings().then(res => {
      if (res && Object.keys(res).length > 0) {
        setStats([
          { num: res.stats_1_num || "100%", label: res.stats_1_label || "Оригинальная техника" },
          { num: res.stats_2_num || "5000+", label: res.stats_2_label || "Довольных клиентов" },
          { num: res.stats_3_num || "5 лет", label: res.stats_3_label || "На рынке Казахстана" },
          { num: res.stats_4_num || "1 год", label: res.stats_4_label || "Гарантия на ноутбуки" },
        ]);
      }
    });
  }, []);

  return (
    <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}>
      {stats.map((s, i) => (
        <div key={i} style={{ background: "var(--surface)", borderRadius: 20, padding: 28, textAlign: "center" }}>
          <div style={{ fontSize: 40, fontWeight: 900, color: "var(--accent)", letterSpacing: "-.02em", lineHeight: 1 }}>{s.num}</div>
          <div style={{ fontSize: 14, color: "var(--text-muted)", marginTop: 8, fontWeight: 500 }}>{s.label}</div>
        </div>
      ))}
    </div>
  );
}
