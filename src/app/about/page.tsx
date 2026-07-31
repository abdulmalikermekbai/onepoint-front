import Link from "next/link";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { ClientAboutStats } from "@/components/ClientStats";

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
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 48, alignItems: "center", marginBottom: 72 }}>
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
            {[
              { icon: "✅", title: "Только оригиналы", desc: "Работаем исключительно с официальными поставщиками. Каждый ноутбук — подлинный, с гарантией 1 год." },
              { icon: "💰", title: "Честные цены", desc: "Никаких скрытых наценок. Регулярные акции для максимальной выгоды." },
              { icon: "🎓", title: "Экспертная консультация", desc: "Наши специалисты помогут подобрать ноутбук для работы, учёбы, дизайна или игр — бесплатно." },
              { icon: "🔧", title: "Сервисный центр", desc: "Гарантийное и послегарантийное обслуживание. Быстрая диагностика и качественный ремонт." },
            ].map(v => (
              <div key={v.title} className="adv-card">
                <div style={{ fontSize: 40 }}>{v.icon}</div>
                <div className="adv-title">{v.title}</div>
                <div className="adv-desc">{v.desc}</div>
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
