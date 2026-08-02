import Link from "next/link";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { ClientAboutStats } from "@/components/ClientStats";

/* ── Inline SVG icons ── */
function IconShield() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" width="32" height="32">
      <path d="M12 2L4 6v5c0 5.25 3.5 10.15 8 11.35C16.5 21.15 20 16.25 20 11V6l-8-4z"/>
      <path d="M9 12l2 2 4-4" strokeLinecap="round" strokeLinejoin="round"/>
    </svg>
  );
}
function IconPriceTag() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" width="32" height="32">
      <path d="M12 2H7a1 1 0 0 0-.707.293l-4 4A1 1 0 0 0 2 7v5a1 1 0 0 0 .293.707l9 9a1 1 0 0 0 1.414 0l9-9a1 1 0 0 0 0-1.414l-9-9A1 1 0 0 0 12 2z"/>
      <circle cx="7.5" cy="7.5" r="1.5" fill="currentColor" stroke="none"/>
    </svg>
  );
}
function IconExpert() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" width="32" height="32">
      <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/>
      <circle cx="9" cy="7" r="4"/>
      <path d="M23 21v-2a4 4 0 0 0-3-3.87M16 3.13a4 4 0 0 1 0 7.75"/>
    </svg>
  );
}
function IconWrench() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" width="32" height="32">
      <path d="M14.7 6.3a1 1 0 0 0 0 1.4l1.6 1.6a1 1 0 0 0 1.4 0l3.77-3.77a6 6 0 0 1-7.94 7.94l-6.91 6.91a2.12 2.12 0 0 1-3-3l6.91-6.91a6 6 0 0 1 7.94-7.94l-3.76 3.76z"/>
    </svg>
  );
}

const VALUES = [
  { Icon: IconShield,   title: "Только оригиналы",       desc: "Работаем исключительно с официальными поставщиками. Каждый ноутбук — подлинный, с гарантией 1 год." },
  { Icon: IconPriceTag, title: "Честные цены",            desc: "Никаких скрытых наценок. Регулярные акции для максимальной выгоды." },
  { Icon: IconExpert,   title: "Экспертная консультация", desc: "Наши специалисты помогут подобрать ноутбук для работы, учёбы, дизайна или игр — бесплатно." },
  { Icon: IconWrench,   title: "Сервисный центр",         desc: "Гарантийное и послегарантийное обслуживание. Быстрая диагностика и качественный ремонт." },
];

export default function AboutPage() {
  return (
    <>
      <Header />
      <div className="page-hero">
        <div className="wrap">
          <div className="breadcrumbs">
            <Link href="/">Главная</Link>
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" width="14" height="14"><path d="M9 18l6-6-6-6"/></svg>
            <span>О компании</span>
          </div>
          <h1>О компании OnePoint</h1>
          <p>Более 5 лет мы помогаем казахстанцам выбрать лучший ноутбук по лучшей цене.</p>
        </div>
      </div>

      <section className="info-section">
        <div className="wrap">
          {/* Mission */}
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 48, alignItems: "center", marginBottom: 72 }} className="about-mission-grid">
            <div>
              <div className="eyebrow">Наша миссия</div>
              <h2 className="section-title" style={{ marginBottom: 20 }}>Делаем технологии доступными</h2>
              <p style={{ fontSize: 16, color: "var(--text-muted)", lineHeight: 1.7, marginBottom: 16 }}>
                OnePoint — это не просто магазин ноутбуков. Это команда экспертов, которая помогает каждому клиенту найти идеальное устройство для его задач и бюджета.
              </p>
              <p style={{ fontSize: 16, color: "var(--text-muted)", lineHeight: 1.7, marginBottom: 24 }}>
                Мы работаем только с официальными поставщиками, гарантируем подлинность каждого ноутбука и предлагаем лучший сервис после продажи.
              </p>
              <a href="https://wa.me/77075511979" target="_blank" rel="noopener noreferrer" className="btn btn-green">Связаться с нами</a>
            </div>
            <ClientAboutStats />
          </div>

          {/* Values */}
          <div className="eyebrow" style={{ marginBottom: 8 }}>Наши ценности</div>
          <h2 className="section-title" style={{ marginBottom: 32 }}>Почему нам доверяют</h2>
          <div className="adv-grid" style={{ marginBottom: 72 }}>
            {VALUES.map(({ Icon, title, desc }) => (
              <div key={title} className="adv-card">
                <div style={{
                  width: 56, height: 56, borderRadius: 16,
                  background: "linear-gradient(135deg,#edfaf3,#d1fae5)",
                  display: "flex", alignItems: "center", justifyContent: "center",
                  color: "var(--success)", marginBottom: 4,
                }}>
                  <Icon />
                </div>
                <div className="adv-title">{title}</div>
                <div className="adv-desc">{desc}</div>
              </div>
            ))}
          </div>

          {/* Brands we work with */}
          <div style={{ background: "var(--surface)", borderRadius: 24, padding: 40, textAlign: "center" }}>
            <div className="eyebrow" style={{ justifyContent: "center", marginBottom: 16 }}>Наши партнёры</div>
            <h2 style={{ fontSize: 26, fontWeight: 800, marginBottom: 32 }}>Официальные бренды</h2>
            <div style={{ display: "flex", gap: 16, flexWrap: "wrap", justifyContent: "center" }}>
              {["ASUS", "Lenovo", "HP", "Acer", "Dell", "MSI", "Apple", "Gigabyte", "Huawei", "Honor"].map(b => (
                <span key={b} style={{ background: "#fff", border: "1.5px solid var(--border)", borderRadius: 12, padding: "12px 24px", fontWeight: 800, fontSize: 16 }}>{b}</span>
              ))}
            </div>
          </div>
        </div>
      </section>

      <Footer />
    </>
  );
}
