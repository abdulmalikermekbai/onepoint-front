"use client";
import { useState, useEffect } from "react";
import Link from "next/link";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import ProductCard from "@/components/ProductCard";
import LaptopSVG from "@/components/LaptopSVG";
import { BRANDS, REVIEWS, formatPrice, fetchLiveProducts, fetchLiveReviews, Product } from "@/lib/data";
import HomeClient from "./HomeClient";
import HomeHeroSlider from "@/components/HomeHeroSlider";
import { ClientStatsGrid } from "@/components/ClientStats";
import { HitProductsGrid, NewProductsGrid } from "./HomePageProducts";

const CATEGORIES = [
  { slug: "gaming", name: "Игровые ноутбуки", fallbackCount: "128 моделей", icon: <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" width="24" height="24"><rect x="2" y="4" width="20" height="13" rx="2"/><path d="M8 21h8M12 17v4"/></svg> },
  { slug: "office", name: "Для работы", fallbackCount: "96 моделей", icon: <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" width="24" height="24"><rect x="3" y="5" width="18" height="12" rx="2"/><path d="M3 17h18M9 21h6"/></svg> },
  { slug: "student", name: "Для учёбы", fallbackCount: "64 модели", icon: <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" width="24" height="24"><path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5"/></svg> },
  { slug: "ultrabook", name: "Ультрабуки", fallbackCount: "52 модели", icon: <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" width="24" height="24"><rect x="4" y="5" width="16" height="11" rx="2"/><path d="M9 20h6"/></svg> },
  { slug: "macbook", name: "MacBook", fallbackCount: "22 модели", icon: <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" width="24" height="24"><path d="M4 4h16v10H4z"/><path d="M2 18h20l-1.5 2h-17z"/></svg> },
  { slug: "rtx", name: "Ноутбуки с RTX", fallbackCount: "87 моделей", icon: <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" width="24" height="24"><rect x="4" y="4" width="16" height="16" rx="2"/><path d="M9 2v2M15 2v2M9 20v2M15 20v2M2 9h2M2 15h2M20 9h2M20 15h2"/></svg> },
  { slug: "oled", name: "OLED-дисплеи", fallbackCount: "34 модели", icon: <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" width="24" height="24"><rect x="2" y="3" width="20" height="14" rx="2"/><path d="M8 21h8M12 17v4"/></svg> },
  { slug: "designer", name: "Для дизайнеров", fallbackCount: "31 модель", icon: <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" width="24" height="24"><circle cx="13" cy="13" r="8"/><path d="M5 5l4 4"/><path d="m17 9-4 4-4 4"/></svg> },
  { slug: "dev", name: "Для программистов", fallbackCount: "44 модели", icon: <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" width="24" height="24"><polyline points="16 18 22 12 16 6"/><polyline points="8 6 2 12 8 18"/></svg> },
  { slug: "video", name: "Видеомонтаж", fallbackCount: "28 моделей", icon: <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" width="24" height="24"><polygon points="23 7 16 12 23 17 23 7"/><rect x="1" y="5" width="15" height="14" rx="2"/></svg> },
  { slug: "business", name: "Для бизнеса", fallbackCount: "45 моделей", icon: <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" width="24" height="24"><rect x="2" y="7" width="20" height="14" rx="2"/><path d="M16 7V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v2"/></svg> },
];

function formatModelCount(num: number): string {
  const abs = Math.abs(num) % 100;
  const last = abs % 10;
  if (abs > 10 && abs < 20) return `${num} моделей`;
  if (last > 1 && last < 5) return `${num} модели`;
  if (last === 1) return `${num} модель`;
  return `${num} моделей`;
}

function DynamicCategoryGrid() {
  const [productsList, setProductsList] = useState<Product[]>([]);

  useEffect(() => {
    fetchLiveProducts().then(list => {
      if (list && list.length > 0) setProductsList(list);
    }).catch(() => {});
  }, []);

  return (
    <div className="cat-grid reveal">
      {CATEGORIES.map((cat) => {
        let countNum = 0;
        if (productsList.length > 0) {
          countNum = productsList.filter(p => {
            if (cat.slug === "rtx") return p.gpu?.toLowerCase().includes("rtx") || p.cardGpu?.toLowerCase().includes("rtx");
            if (cat.slug === "oled") return p.matrixType === "OLED" || p.display?.toLowerCase().includes("oled");
            if (p.categories && p.categories.includes(cat.slug)) return true;
            if (p.categorySlug === cat.slug) return true;
            if (cat.slug === "gaming") return p.categorySlug === "gaming" || p.gpu?.toLowerCase().includes("rtx") || p.gpu?.toLowerCase().includes("gtx");
            if (cat.slug === "office" || cat.slug === "student" || cat.slug === "business") return p.categorySlug === cat.slug || p.categorySlug === "office" || p.categorySlug === "ultrabook" || p.categorySlug === "business";
            if (cat.slug === "designer" || cat.slug === "video" || cat.slug === "dev") return p.categorySlug === cat.slug || p.gpu?.toLowerCase().includes("rtx") || (parseInt(p.ram || "0") >= 16);
            return false;
          }).length;
        }

        const countText = countNum > 0 ? formatModelCount(countNum) : cat.fallbackCount;

        return (
          <Link key={cat.slug} href={`/catalog?cat=${cat.slug}`} className="cat-card">
            <div className="cat-icon-wrap">{cat.icon}</div>
            <div>
              <div className="cat-name">{cat.name}</div>
              <div className="cat-count">{countText}</div>
            </div>
          </Link>
        );
      })}
    </div>
  );
}

function DynamicReviewsGrid() {
  const [reviewsList, setReviewsList] = useState<any[]>(REVIEWS);

  useEffect(() => {
    fetchLiveReviews().then((dbRevs) => {
      if (dbRevs && dbRevs.length > 0) {
        const mapped = dbRevs.map((r: any) => ({
          author: r.author_name,
          initials: r.initials || (r.author_name ? r.author_name.charAt(0) + "." : "А.Б."),
          text: r.body,
          product: r.pname || "Покупатель в 2ГИС",
          rating: Number(r.rating) || 5,
          color: "linear-gradient(135deg,#059669,#10b981)",
          source: r.source || "2GIS",
          link: r.review_link || "https://go.2gis.com/LvGaV",
        }));
        setReviewsList(mapped);
      }
    }).catch(() => {});
  }, []);

  return (
    <div className="reviews-grid reveal">
      {reviewsList.map((r, i) => (
        <div key={i} className="review-card">
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 12 }}>
            <div style={{ color: "var(--accent-tint-2)" }}>
              <svg viewBox="0 0 24 24" fill="currentColor" width="28" height="28">
                <path d="M9.5 5C6 5 3 8 3 12.5S6 20 9.5 20c1 0 1.8-.8 1.8-1.8s-.8-1.7-1.8-1.7c-1.6 0-3-1.4-3-3.2 0-.4.1-.8.2-1.1.4.2.9.3 1.3.3 1.7 0 3-1.4 3-3.2S11.2 5 9.5 5Zm10 0c-3.5 0-6.5 3-6.5 7.5S16 20 19.5 20c1 0 1.8-.8 1.8-1.8s-.8-1.7-1.8-1.7c-1.6 0-3-1.4-3-3.2 0-.4.1-.8.2-1.1.4.2.9.3 1.3.3 1.7 0 3-1.4 3-3.2S21.2 5 19.5 5Z" />
              </svg>
            </div>
            <a
              href={r.link || "https://go.2gis.com/LvGaV"}
              target="_blank"
              rel="noopener noreferrer"
              className="badge-2gis-review"
            >
              <span>2ГИС</span> Проверенный отзыв ↗
            </a>
          </div>
          <p className="review-text">{r.text}</p>
          <div style={{ display: "flex", alignItems: "center", gap: 12, marginTop: "auto", paddingTop: 6 }}>
            <div className="review-avatar" style={{ background: r.color || "linear-gradient(135deg,#059669,#10b981)" }}>{r.initials}</div>
            <div>
              <div style={{ fontSize: 14, fontWeight: 700 }}>{r.author}</div>
              <div style={{ fontSize: 12, color: "var(--text-soft)" }}>{r.product}</div>
            </div>
            <div style={{ marginLeft: "auto", color: "#FFB100", fontSize: 12 }}>{"★".repeat(r.rating)}</div>
          </div>
        </div>
      ))}
    </div>
  );
}

const ADVANTAGES = [
  { icon: <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" width="25" height="25"><path d="M1 3h15v13H1zM16 8h4l3 3v5h-7V8z"/><circle cx="5.5" cy="18.5" r="2.5"/><circle cx="18.5" cy="18.5" r="2.5"/></svg>, title: "Надежная доставка", desc: "По всему Казахстану СДЭК и Индрайв со страховкой груза." },
  { icon: <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" width="25" height="25"><path d="M12 2 4 6v6c0 5 3.4 8.7 8 10 4.6-1.3 8-5 8-10V6l-8-4Z"/><path d="m9 12 2 2 4-4"/></svg>, title: "Гарантия до 1 года", desc: "Гарантия 1 год и надежная сервисная поддержка." },
  { icon: <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" width="25" height="25"><path d="M9 12l2 2 4-4"/><circle cx="12" cy="12" r="10"/></svg>, title: "Проверка перед отправкой", desc: "Каждый ноутбук проходит полную диагностику экранов, тесты и предпродажную проверку." },
  { icon: <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" width="25" height="25"><path d="M22 16.9v3a2 2 0 0 1-2.2 2 19.8 19.8 0 0 1-8.6-3.1 19.5 19.5 0 0 1-6-6A19.8 19.8 0 0 1 2.1 4.2 2 2 0 0 1 4.1 2h3a2 2 0 0 1 2 1.7c.1.9.3 1.8.6 2.7a2 2 0 0 1-.5 2.1L8 9.7a16 16 0 0 0 6 6l1.2-1.2a2 2 0 0 1 2.1-.5c.9.3 1.8.5 2.7.6a2 2 0 0 1 1.7 2Z"/></svg>, title: "Помощь в подборе", desc: "Опытные специалисты подберут идеальный ноутбук под ваши задачи и бюджет." },
  { icon: <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" width="25" height="25"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/></svg>, title: "Консультация 10/7", desc: "На связи ежедневно с 10:00 до 20:00 в мессенджерах и по телефону." },
  { icon: <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" width="25" height="25"><circle cx="12" cy="12" r="10"/><path d="M12 6v6l4 2"/></svg>, title: "Более 5 лет опыта", desc: "Тысячи довольных покупателей по всему Казахстану. Оригинальная продукция." },
];

export default function HomePage() {
  const waHero = `https://wa.me/77075511979?text=Здравствуйте!%20Интересует%20подбор%20ноутбука`;

  return (
    <>
      <Header />
      <HomeClient />

      <main>
        {/* ============ HERO ============ */}
        <section className="hero-section">
          <div className="wrap">
            <HomeHeroSlider />

            {/* Quick Stats */}
            <ClientStatsGrid />

            {/* Trust Highlights Bar */}
            <div style={{ background: "linear-gradient(135deg, #111116 0%, #1c1c24 100%)", color: "#fff", borderRadius: 20, padding: "20px 24px", marginTop: 24, border: "1px solid rgba(255,255,255,0.08)", boxShadow: "0 10px 30px -10px rgba(0,0,0,0.3)" }} className="reveal">
              <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))", gap: 16, alignItems: "center" }}>
                <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                  <div style={{ width: 42, height: 42, borderRadius: 12, background: "rgba(255,90,31,0.15)", color: "var(--accent)", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" width="22" height="22"><path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5"/></svg>
                  </div>
                  <div>
                    <div style={{ fontWeight: 800, fontSize: 14.5, color: "#fff" }}>ONEPOINT.KZ</div>
                    <div style={{ fontSize: 12.5, color: "rgba(255,255,255,0.65)" }}>Новые оригинальные ноутбуки</div>
                  </div>
                </div>
                <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                  <div style={{ width: 42, height: 42, borderRadius: 12, background: "rgba(34,197,94,0.15)", color: "#22c55e", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" width="22" height="22"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/></svg>
                  </div>
                  <div>
                    <div style={{ fontWeight: 800, fontSize: 14.5, color: "#fff" }}>Гарантия 1 год</div>
                    <div style={{ fontSize: 12.5, color: "rgba(255,255,255,0.65)" }}>Оригиналы в запечатанной упаковке</div>
                  </div>
                </div>
                <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                  <div style={{ width: 42, height: 42, borderRadius: 12, background: "rgba(59,130,246,0.15)", color: "#3b82f6", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" width="22" height="22"><rect x="2" y="4" width="20" height="13" rx="2"/><path d="m10 9 5 3-5 3Z"/></svg>
                  </div>
                  <div>
                    <div style={{ fontWeight: 800, fontSize: 14.5, color: "#fff" }}>Видео-проверка</div>
                    <div style={{ fontSize: 12.5, color: "rgba(255,255,255,0.65)" }}>Перед покупкой и отправкой</div>
                  </div>
                </div>
                <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                  <div style={{ width: 42, height: 42, borderRadius: 12, background: "rgba(168,85,247,0.15)", color: "#a855f7", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" width="22" height="22"><polyline points="20 6 9 17 4 12"/></svg>
                  </div>
                  <div>
                    <div style={{ fontWeight: 800, fontSize: 14.5, color: "#fff" }}>Бесплатная подготовка</div>
                    <div style={{ fontSize: 12.5, color: "rgba(255,255,255,0.65)" }}>Windows / Office / Драйверы</div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* ============ CATEGORIES ============ */}
        <section id="catalog" style={{ paddingTop: 72 }}>
          <div className="wrap">
            <div className="section-head reveal">
              <div>
                <div className="eyebrow">Каталог</div>
                <h2 className="section-title">Выберите категорию</h2>
                <p className="section-sub">Найдите идеальный ноутбук для ваших задач</p>
              </div>
              <Link href="/catalog" className="link-arrow">
                Весь каталог
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4" width="16" height="16"><path d="M5 12h14M13 6l6 6-6 6"/></svg>
              </Link>
            </div>

            <DynamicCategoryGrid />
          </div>
        </section>

        {/* ============ HIT PRODUCTS ============ */}
        <section id="popular" style={{ background: "var(--surface)" }}>
          <div className="wrap">
            <div className="section-head reveal">
              <div>
                <div className="eyebrow">Хиты продаж</div>
                <h2 className="section-title">Популярные ноутбуки</h2>
                <p className="section-sub">Модели, которые чаще всего выбирают наши покупатели.</p>
              </div>
              <Link href="/bestsellers" className="link-arrow">
                Все хиты
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4" width="16" height="16"><path d="M5 12h14M13 6l6 6-6 6"/></svg>
              </Link>
            </div>
            <HitProductsGrid />
          </div>
        </section>

        {/* ============ BRANDS ============ */}
        <section>
          <div className="wrap">
            <div className="section-head reveal">
              <div>
                <div className="eyebrow">Официальные партнёры</div>
                <h2 className="section-title">Популярные бренды</h2>
              </div>
            </div>
            <div className="brand-strip reveal">
              {BRANDS.map((b) => (
                <Link key={b.slug} href={`/catalog?brand=${b.slug}`} className="brand-item">
                  <span className="brand-word">{b.name}</span>
                </Link>
              ))}
            </div>
          </div>
        </section>

        {/* ============ PROMO BANNERS ============ */}
        <section id="promo">
          <div className="wrap">
            <div className="section-head reveal">
              <div>
                <div className="eyebrow">Акции</div>
                <h2 className="section-title">Лучшие предложения недели</h2>
                <p className="section-sub">Подберите ноутбук со скидкой до 200 000 ₸</p>
              </div>
              <Link href="/promotions" className="link-arrow">
                Все акции
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4" width="16" height="16"><path d="M5 12h14M13 6l6 6-6 6"/></svg>
              </Link>
            </div>
            <div className="promo-grid reveal">
              <div className="promo-card orange">
                <div className="promo-orb" />
                <span className="promo-tag"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" width="14" height="14" style={{verticalAlign:"middle",marginRight:4}}><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/></svg>БЕСПЛАТНАЯ УСЛУГА</span>
                <div className="promo-title">Полная подготовка ноутбука</div>
                <p className="promo-desc">Бесплатно установим Windows, настроим все необходимые драйверы для работы и подарим лицензионный бессрочный Microsoft Office Pro Plus.</p>
                <a
                  href={`https://wa.me/77075511979?text=${encodeURIComponent("Здравствуйте! Подскажите, пожалуйста, по наличию ноутбуков и консультации.")}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="btn btn-dark btn-sm"
                >
                  Написать в WhatsApp
                </a>
              </div>
              <div className="promo-card dark" style={{ backgroundImage: "linear-gradient(135deg,#1B1B21,#0D0D11)", position: "relative" }}>
                <div style={{ position: "absolute", width: 220, height: 220, borderRadius: "50%", background: "rgba(255,90,31,.16)", bottom: -100, right: 20 }} />
                <span className="promo-tag"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" width="14" height="14" style={{verticalAlign:"middle",marginRight:4}}><path d="M13 2L3 14h9l-1 8 10-12h-9l1-8z"/></svg>СПЕЦЦЕНЫ НЕДЕЛИ</span>
                <div className="promo-title">Популярные ноутбуки по выгодной цене</div>
                <p className="promo-desc">Выбирайте модели со скидкой из наличия — количество ограничено.</p>
                <Link href="/catalog?sale=1" className="btn btn-primary btn-sm">
                  Смотреть предложения
                </Link>
              </div>
            </div>
          </div>
        </section>

        {/* ============ NEW ARRIVALS ============ */}
        <section style={{ background: "var(--surface)" }}>
          <div className="wrap">
            <div className="section-head reveal">
              <div>
                <div className="eyebrow">Новинки</div>
                <h2 className="section-title">Новейшие модели 2025</h2>
                <p className="section-sub">Свежие поступления с RTX 50xx и Intel Core Ultra</p>
              </div>
              <Link href="/new-arrivals" className="link-arrow">
                Все новинки
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4" width="16" height="16"><path d="M5 12h14M13 6l6 6-6 6"/></svg>
              </Link>
            </div>
            <NewProductsGrid />
          </div>
        </section>

        {/* ============ FOR WHOM ============ */}
        <section>
          <div className="wrap">
            <div className="section-head reveal">
              <div>
                <div className="eyebrow">Подбор</div>
                <h2 className="section-title">Ноутбук для любых задач</h2>
              </div>
            </div>
            <div className="use-case-grid reveal">
              {[
                { icon: <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" width="28" height="28"><path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20"/><path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z"/></svg>, label: "Для учёбы", slug: "student" },
                { icon: <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" width="28" height="28"><rect x="2" y="7" width="20" height="14" rx="2"/><path d="M16 7V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v2"/></svg>, label: "Для офиса", slug: "office" },
                { icon: <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" width="28" height="28"><polyline points="16 18 22 12 16 6"/><polyline points="8 6 2 12 8 18"/></svg>, label: "Для программистов", slug: "dev" },
                { icon: <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" width="28" height="28"><rect x="2" y="4" width="20" height="13" rx="2"/><path d="M8 21h8M12 17v4"/><path d="M6 8l4 4-4 4"/></svg>, label: "Для игр", slug: "gaming" },
                { icon: <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" width="28" height="28"><polygon points="23 7 16 12 23 17 23 7"/><rect x="1" y="5" width="15" height="14" rx="2"/></svg>, label: "Видеомонтаж", slug: "video" },
                { icon: <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" width="28" height="28"><rect x="4" y="4" width="16" height="16" rx="2"/><path d="M9 2v2M15 2v2M9 20v2M15 20v2M2 9h2M2 15h2M20 9h2M20 15h2"/></svg>, label: "Для 3D/AutoCAD", slug: "designer" },
                { icon: <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" width="28" height="28"><circle cx="13.5" cy="6.5" r="2.5"/><circle cx="6" cy="12" r="2"/><circle cx="18" cy="16" r="2"/><path d="M11 6.5L8 12M15.5 8l2.5 6"/></svg>, label: "Для дизайна", slug: "designer" },
                { icon: <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" width="28" height="28"><rect x="4" y="5" width="16" height="11" rx="2"/><path d="M2 20h20M12 16v4"/></svg>, label: "Для путешествий", slug: "ultrabook" },
                { icon: <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" width="28" height="28"><path d="M12 20V10M18 20V4M6 20v-4"/></svg>, label: "Для бизнеса", slug: "business" },
                { icon: <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" width="28" height="28"><path d="M13 2L3 14h9l-1 8 10-12h-9l1-8z"/></svg>, label: "Ультрабуки", slug: "ultrabook" },
              ].map((item) => (
                <Link
                  key={item.label}
                  href={`/catalog?cat=${item.slug}`}
                  className="use-case-card"
                >
                  <span className="use-case-icon">{item.icon}</span>
                  <span>{item.label}</span>
                </Link>
              ))}
            </div>
          </div>
        </section>

        {/* ============ ADVANTAGES ============ */}
        <section className="adv-section">
          <div className="wrap">
            <div className="section-head reveal">
              <div>
                <div className="eyebrow">Почему OnePoint</div>
                <h2 className="section-title">Покупать у нас — выгодно</h2>
              </div>
            </div>
            <div className="adv-grid reveal">
              {ADVANTAGES.map((a) => (
                <div key={a.title} className="adv-card">
                  <div className="adv-icon">{a.icon}</div>
                  <div className="adv-title">{a.title}</div>
                  <div className="adv-desc">{a.desc}</div>
                </div>
              ))}
            </div>

            {/* Stats row */}
            <div style={{ display: "flex", flexWrap: "wrap", gap: 12, marginTop: 32, justifyContent: "center" }} className="reveal">
              {["✔ Более 5 лет опыта","✔ Огромный выбор моделей","✔ Тысячи довольных клиентов","✔ Гарантия 1 год","✔ Проверенная техника","✔ Лучшие цены","✔ Быстрая доставка"].map(s => (
                <span key={s} style={{ background: "#fff", border: "1.5px solid var(--border)", borderRadius: 100, padding: "8px 16px", fontSize: 13.5, fontWeight: 600, color: "var(--text)" }}>{s}</span>
              ))}
            </div>
          </div>
        </section>

        {/* ============ REVIEWS ============ */}
        <section id="reviews">
          <div className="wrap">
            <div className="section-head reveal">
              <div>
                <div className="eyebrow">Отзывы покупателей</div>
                <h2 className="section-title">Что говорят клиенты</h2>
                <p className="section-sub">Отзывы реальных покупателей из 2GIS</p>
              </div>
              <div style={{ display: "flex", flexWrap: "wrap", alignItems: "center", gap: 12 }}>
                <a
                  href="https://go.2gis.com/LvGaV"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="twogis-rating-card"
                >
                  <div className="twogis-logo-badge">2ГИС</div>
                  <div className="twogis-stars-val">
                    <span>★★★★★</span> 5.0 / 5.0
                  </div>
                </a>
                <a
                  href="https://go.2gis.com/LvGaV"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="btn btn-secondary"
                  style={{ display: "inline-flex", alignItems: "center", gap: 8, padding: "10px 18px", borderRadius: 16, fontSize: 13.5, fontWeight: 800, textDecoration: "none", background: "rgba(101, 163, 13, 0.12)", color: "#4d7c0f", border: "1px solid rgba(101, 163, 13, 0.3)" }}
                >
                  Посмотреть в 2ГИС ↗
                </a>
              </div>
            </div>

            <DynamicReviewsGrid />
          </div>
        </section>

        {/* ============ DELIVERY PREVIEW ============ */}
        <section style={{ background: "var(--surface)" }}>
          <div className="wrap">
            <div className="section-head reveal">
              <div>
                <div className="eyebrow">Доставка и самовывоз</div>
                <h2 className="section-title">Быстро и надёжно</h2>
              </div>
              <Link href="/delivery" className="link-arrow">
                Подробнее о доставке
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4" width="16" height="16"><path d="M5 12h14M13 6l6 6-6 6"/></svg>
              </Link>
            </div>
            <div className="delivery-grid reveal">
              {[
                { icon: <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" width="28" height="28"><circle cx="12" cy="12" r="10"/><path d="M12 6v6l4 2"/></svg>, title: "Алматы", desc: "Курьерская доставка в день заказа или на следующий день. Сборка и проверка при вас." },
                { icon: <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" width="28" height="28"><path d="M1 3h15v13H1zM16 8h4l3 3v5h-7V8z"/><circle cx="5.5" cy="18.5" r="2.5"/><circle cx="18.5" cy="18.5" r="2.5"/></svg>, title: "По Казахстану", desc: "Отправляем во все города надёжными транспортными компаниями. Страхование груза." },
                { icon: <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" width="28" height="28"><path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/><polyline points="9 22 9 12 15 12 15 22"/></svg>, title: "Самовывоз", desc: "г. Алматы, пр. Абылай хана, ТЦ Алтын-Тараз, 1 этаж, магазин 32-33. Ежедневно 10:00–20:00" },
              ].map((d) => (
                <div key={d.title} className="info-card delivery-card">
                  <div className="delivery-icon-wrap">{d.icon}</div>
                  <div>
                    <h3 style={{ marginBottom: 8, fontSize: 18 }}>{d.title}</h3>
                    <p>{d.desc}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ============ CONSULTATION ============ */}
        <section>
          <div className="wrap">
            <div className="newsletter-card reveal">
              <div className="newsletter-glow" />
              <div style={{ position: "relative", zIndex: 2, maxWidth: 460 }}>
                <h3 style={{ color: "#fff", fontSize: 30, fontWeight: 800, letterSpacing: "-.02em", marginBottom: 12, lineHeight: 1.15 }}>
                  Нужна помощь в выборе ноутбука?
                </h3>
                <p style={{ color: "rgba(255,255,255,.6)", fontSize: 15, lineHeight: 1.6 }}>
                  Оставьте свой номер телефона, и наш эксперт перезвонит вам в течение 10 минут для бесплатной консультации.
                </p>
              </div>
              <ConsultationForm />
            </div>
          </div>
        </section>

        {/* ============ CONTACTS PREVIEW ============ */}
        <section style={{ background: "var(--surface)" }}>
          <div className="wrap">
            <div className="section-head reveal">
              <div>
                <div className="eyebrow">Контакты</div>
                <h2 className="section-title">Мы на связи</h2>
              </div>
              <Link href="/contacts" className="link-arrow">
                Страница контактов
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4" width="16" height="16"><path d="M5 12h14M13 6l6 6-6 6"/></svg>
              </Link>
            </div>
            <div className="contacts-home-grid reveal">
              <a href="tel:+77075511979" className="contact-card">
                <div className="contact-icon">
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" width="26" height="26">
                    <path d="M22 16.9v3a2 2 0 0 1-2.2 2 19.8 19.8 0 0 1-8.6-3.1 19.5 19.5 0 0 1-6-6A19.8 19.8 0 0 1 2.1 4.2 2 2 0 0 1 4.1 2h3a2 2 0 0 1 2 1.7c.1.9.3 1.8.6 2.7a2 2 0 0 1-.5 2.1L8 9.7a16 16 0 0 0 6 6l1.2-1.2a2 2 0 0 1 2.1-.5c.9.3 1.8.5 2.7.6a2 2 0 0 1 1.7 2Z" />
                  </svg>
                </div>
                <div>
                  <div style={{ fontWeight: 700, fontSize: 16, marginBottom: 4 }}>Позвонить</div>
                  <div style={{ fontSize: 18, fontWeight: 800 }}>+7 (707) 551-19-79</div>
                  <div style={{ fontSize: 13, color: "var(--text-muted)", marginTop: 4 }}>Ежедневно 10:00–19:00</div>
                </div>
              </a>
              <a href="https://wa.me/77075511979" target="_blank" rel="noopener noreferrer" className="contact-card">
                <div className="contact-icon" style={{ background: "#f0fdf4" }}>
                  <svg viewBox="0 0 24 24" fill="#25D366" width="26" height="26">
                    <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347z"/>
                    <path d="M12 0C5.373 0 0 5.373 0 12c0 2.125.556 4.122 1.528 5.855L.057 23.082a1 1 0 0 0 1.224 1.3l5.396-1.416A11.942 11.942 0 0 0 12 24c6.627 0 12-5.373 12-12S18.627 0 12 0zm0 22c-1.896 0-3.665-.522-5.176-1.432l-.361-.217-3.742.981.999-3.648-.235-.374A9.96 9.96 0 0 1 2 12C2 6.477 6.477 2 12 2s10 4.477 10 10-4.477 10-10 10z"/>
                  </svg>
                </div>
                <div>
                  <div style={{ fontWeight: 700, fontSize: 16, marginBottom: 4 }}>WhatsApp</div>
                  <div style={{ fontSize: 18, fontWeight: 800 }}>+7 (707) 551-19-79</div>
                  <div style={{ fontSize: 13, color: "var(--text-muted)", marginTop: 4 }}>Быстрый ответ</div>
                </div>
              </a>
              <a href="mailto:info@onepoint.kz" className="contact-card">
                <div className="contact-icon">
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" width="26" height="26">
                    <path d="M4 4h16v16H4z" />
                    <path d="m22 6-10 7L2 6" />
                  </svg>
                </div>
                <div>
                  <div style={{ fontWeight: 700, fontSize: 16, marginBottom: 4 }}>Email</div>
                  <div style={{ fontSize: 17, fontWeight: 800 }}>info@onepoint.kz</div>
                  <div style={{ fontSize: 13, color: "var(--text-muted)", marginTop: 4 }}>Ответим в течение часа</div>
                </div>
              </a>
            </div>
          </div>
        </section>
      </main>

      <Footer />
    </>
  );
}

// Consultation form component (sends name and phone to Telegram bot/database)
function ConsultationForm() {
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [sent, setSent] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    await fetch("/api/lead", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ type: "consultation", name, phone, message: "Заявка на консультацию с главной страницы" }),
    }).catch(() => {});
    setSent(true);
  };

  if (sent) {
    return (
      <div style={{ color: "#fff", fontSize: 16, fontWeight: 700, padding: "10px 0", position: "relative", zIndex: 2 }}>
        Спасибо! Мы свяжемся с вами в течение 10 минут.
      </div>
    );
  }

  return (
    <div style={{ position: "relative", zIndex: 2 }}>
      <form
        style={{ display: "flex", gap: 10, flexWrap: "wrap" }}
        onSubmit={handleSubmit}
      >
        <input
          type="text"
          required
          placeholder="Ваше имя"
          value={name}
          onChange={e => setName(e.target.value)}
          style={{
            width: 180,
            padding: "16px 20px",
            borderRadius: 100,
            border: "1.5px solid rgba(255,255,255,.18)",
            background: "rgba(255,255,255,.06)",
            color: "#fff",
            fontSize: 14.5,
            outline: "none",
            fontFamily: "inherit",
          }}
        />
        <input
          type="tel"
          required
          placeholder="Ваш телефон"
          value={phone}
          onChange={e => setPhone(e.target.value)}
          style={{
            width: 220,
            padding: "16px 20px",
            borderRadius: 100,
            border: "1.5px solid rgba(255,255,255,.18)",
            background: "rgba(255,255,255,.06)",
            color: "#fff",
            fontSize: 14.5,
            outline: "none",
            fontFamily: "inherit",
          }}
        />
        <button type="submit" className="btn btn-primary" style={{ padding: "16px 30px" }}>Заказать звонок</button>
      </form>
      <div style={{ color: "rgba(255,255,255,.35)", fontSize: 11.5, marginTop: 10 }}>
        Отправляя форму, вы соглашаетесь с{" "}
        <a href="/privacy" style={{ color: "rgba(255,255,255,.5)", textDecoration: "underline" }}>политикой конфиденциальности</a>
      </div>
    </div>
  );
}
