"use client";
import Link from "next/link";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { CATEGORIES } from "@/lib/data";

export default function CategoriesPage() {
  const extendedCategories = [
    ...CATEGORIES,
    { slug: "gaming", name: "Игровые ноутбуки", icon: "🎮", count: "128 моделей", desc: "RTX 5060/5070/5080, высокочастотные дисплеи 144–240 Гц" },
    { slug: "office", name: "Ноутбуки для работы", icon: "💼", count: "96 моделей", desc: "Надёжные офисные решения для бизнеса" },
    { slug: "student", name: "Для учёбы", icon: "📚", count: "64 модели", desc: "Доступные и надёжные для студентов" },
    { slug: "ultrabook", name: "Ультрабуки", icon: "⚡", count: "52 модели", desc: "Тонкие и лёгкие, до 1.5 кг" },
    { slug: "macbook", name: "MacBook", icon: "🍎", count: "22 модели", desc: "Apple MacBook Air и Pro" },
    { slug: "designer", name: "Для дизайнеров", icon: "🎨", count: "31 модель", desc: "OLED, цветоточные экраны" },
    { slug: "dev", name: "Для разработчиков", icon: "👨‍💻", count: "44 модели", desc: "RAM 32+ ГБ, Linux ready" },
    { slug: "video", name: "Для видеомонтажа", icon: "🎬", count: "28 моделей", desc: "RTX, большой SSD, цветоточный дисплей" },
    { slug: "rtx", name: "Ноутбуки с RTX", icon: "🖥️", count: "87 моделей", desc: "NVIDIA GeForce RTX 40/50 серии" },
    { slug: "oled", name: "OLED дисплеи", icon: "✨", count: "34 модели", desc: "OLED-матрица для идеальной картинки" },
    { slug: "business", name: "Для бизнеса", icon: "🏢", count: "45 моделей", desc: "Корпоративные решения" },
    { slug: "accessories", name: "Аксессуары", icon: "🛍️", count: "210 товаров", desc: "Мыши, сумки, коврики, хабы" },
  ];

  const unique = extendedCategories.filter((cat, idx, self) => self.findIndex(c => c.slug === cat.slug) === idx);

  return (
    <>
      <Header />
      <div className="page-hero">
        <div className="wrap">
          <div className="breadcrumbs">
            <Link href="/">Главная</Link>
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" width="14" height="14"><path d="M9 18l6-6-6-6"/></svg>
            <span>Категории</span>
          </div>
          <h1>Категории ноутбуков</h1>
          <p>Выберите тип ноутбука для ваших задач</p>
        </div>
      </div>

      <section className="info-section">
        <div className="wrap">
          <div style={{ display: "grid", gridTemplateColumns: "repeat(4,1fr)", gap: 20 }}>
            {unique.map(cat => (
              <Link
                key={cat.slug}
                href={`/catalog?cat=${cat.slug}`}
                style={{
                  background: "#fff",
                  border: "1.5px solid var(--border)",
                  borderRadius: 20,
                  padding: "28px 24px",
                  display: "flex",
                  flexDirection: "column",
                  gap: 12,
                  transition: "transform .3s, box-shadow .3s, border-color .3s",
                }}
                onMouseEnter={e => {
                  const el = e.currentTarget as HTMLElement;
                  el.style.transform = "translateY(-6px)";
                  el.style.boxShadow = "var(--shadow-card)";
                  el.style.borderColor = "transparent";
                }}
                onMouseLeave={e => {
                  const el = e.currentTarget as HTMLElement;
                  el.style.transform = "";
                  el.style.boxShadow = "";
                  el.style.borderColor = "var(--border)";
                }}
              >
                <span style={{ fontSize: 40 }}>{"icon" in cat ? cat.icon : "💻"}</span>
                <div>
                  <div style={{ fontWeight: 700, fontSize: 17, marginBottom: 4 }}>{cat.name}</div>
                  <div style={{ fontSize: 13, color: "var(--text-soft)", marginBottom: 8 }}>{cat.count}</div>
                  <div style={{ fontSize: 13.5, color: "var(--text-muted)", lineHeight: 1.5 }}>{"desc" in cat ? cat.desc : ""}</div>
                </div>
                <div style={{ marginTop: "auto", color: "var(--accent)", fontSize: 13.5, fontWeight: 700, display: "flex", alignItems: "center", gap: 4 }}>
                  Смотреть
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4" width="14" height="14"><path d="M5 12h14M13 6l6 6-6 6"/></svg>
                </div>
              </Link>
            ))}
          </div>

          {/* By purpose */}
          <div style={{ marginTop: 72 }}>
            <div className="eyebrow">Подбор по задачам</div>
            <h2 className="section-title" style={{ marginBottom: 32 }}>Для кого ноутбук?</h2>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(5,1fr)", gap: 14 }}>
              {[
                { emoji: "📚", label: "Для учёбы", slug: "student" },
                { emoji: "💼", label: "Для офиса", slug: "office" },
                { emoji: "👨‍💻", label: "Программисты", slug: "dev" },
                { emoji: "🎮", label: "Для игр", slug: "gaming" },
                { emoji: "🎬", label: "Видеомонтаж", slug: "video" },
                { emoji: "🏗️", label: "3D/AutoCAD", slug: "designer" },
                { emoji: "🎨", label: "Для дизайна", slug: "designer" },
                { emoji: "✈️", label: "Путешествия", slug: "ultrabook" },
                { emoji: "💡", label: "Для бизнеса", slug: "business" },
                { emoji: "⚡", label: "Ультрабуки", slug: "ultrabook" },
              ].map(item => (
                <Link
                  key={item.label}
                  href={`/catalog?cat=${item.slug}`}
                  style={{
                    background: "var(--surface)",
                    borderRadius: 16,
                    padding: "20px 16px",
                    textAlign: "center",
                    fontWeight: 600,
                    fontSize: 13.5,
                    display: "flex",
                    flexDirection: "column",
                    alignItems: "center",
                    gap: 10,
                    transition: "background .2s, transform .2s",
                    border: "1.5px solid transparent",
                  }}
                  onMouseEnter={e => {
                    const el = e.currentTarget as HTMLElement;
                    el.style.background = "#fff";
                    el.style.transform = "translateY(-4px)";
                    el.style.borderColor = "var(--border)";
                  }}
                  onMouseLeave={e => {
                    const el = e.currentTarget as HTMLElement;
                    el.style.background = "var(--surface)";
                    el.style.transform = "";
                    el.style.borderColor = "transparent";
                  }}
                >
                  <span style={{ fontSize: 32 }}>{item.emoji}</span>
                  <span>{item.label}</span>
                </Link>
              ))}
            </div>
          </div>
        </div>
      </section>

      <Footer />
    </>
  );
}
