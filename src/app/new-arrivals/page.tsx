import Link from "next/link";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import ProductCard from "@/components/ProductCard";
import { PRODUCTS } from "@/lib/data";

const newProducts = PRODUCTS.filter(p => p.isNew);

export default function NewArrivalsPage() {
  return (
    <>
      <Header />
      <div className="page-hero">
        <div className="wrap">
          <div className="breadcrumbs">
            <Link href="/">Главная</Link>
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" width="14" height="14"><path d="M9 18l6-6-6-6"/></svg>
            <span>Новинки</span>
          </div>
          <h1>✨ Новинки 2025</h1>
          <p>Новейшие модели ноутбуков с RTX 50xx, Intel Core Ultra и Snapdragon X. Уже доступны в OnePoint.</p>
        </div>
      </div>

      <section>
        <div className="wrap">
          {/* New tech badges */}
          <div style={{ display: "flex", gap: 12, flexWrap: "wrap", marginBottom: 48 }}>
            {["RTX 50xx серия", "Intel Core Ultra", "AMD Ryzen 9000", "Snapdragon X Plus", "Wi-Fi 7", "LPDDR5x", "PCIe Gen 5", "Mini-LED"].map(t => (
              <span key={t} style={{ background: "var(--accent-tint)", color: "var(--accent)", padding: "8px 18px", borderRadius: 100, fontSize: 13.5, fontWeight: 700 }}>{t}</span>
            ))}
          </div>

          <div className="section-head">
            <div>
              <div className="eyebrow">Новинки</div>
              <h2 className="section-title">Свежие поступления</h2>
            </div>
          </div>

          <div className="product-grid">
            {newProducts.map(p => <ProductCard key={p.id} product={p} />)}
          </div>

          {/* What's new section */}
          <div style={{ marginTop: 72, background: "linear-gradient(135deg,#0D0D11,#1B1710)", borderRadius: 28, padding: 48, color: "#fff" }}>
            <div className="eyebrow" style={{ color: "var(--accent)" }}>Технологии 2025</div>
            <h2 style={{ fontSize: 32, fontWeight: 800, marginBottom: 32, letterSpacing: "-.02em" }}>Что нового в ноутбуках 2025 года</h2>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(3,1fr)", gap: 24 }}>
              {[
                { icon: "🎮", title: "RTX 50xx Series", desc: "Новое поколение NVIDIA GeForce RTX 5060/5070/5080 — до 70% прироста в играх по сравнению с RTX 40xx" },
                { icon: "⚡", title: "Intel Core Ultra 200HX", desc: "Гибридная архитектура, встроенный NPU для AI-задач, до 24 ядер и Thunderbolt 4" },
                { icon: "📡", title: "Wi-Fi 7", desc: "Скорость до 46 Гбит/с, минимальные задержки для игр и стриминга в 4K" },
                { icon: "💾", title: "PCIe Gen 5 NVMe", desc: "SSD нового поколения — скорость чтения до 14 000 МБ/с, вдвое быстрее Gen 4" },
                { icon: "🖥️", title: "Mini-LED и OLED", desc: "Матрицы с высочайшим контрастом, яркостью до 2000 нит и 240 Гц частотой" },
                { icon: "🤖", title: "AI-функции", desc: "Встроенные NPU для фоновый шумоподавления, суперразрешения и умного энергопотребления" },
              ].map(item => (
                <div key={item.title} style={{ background: "rgba(255,255,255,.06)", borderRadius: 16, padding: 24 }}>
                  <span style={{ fontSize: 36, display: "block", marginBottom: 12 }}>{item.icon}</span>
                  <h3 style={{ fontSize: 18, fontWeight: 700, marginBottom: 8 }}>{item.title}</h3>
                  <p style={{ fontSize: 14, color: "rgba(255,255,255,.65)", lineHeight: 1.6 }}>{item.desc}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      <Footer />
    </>
  );
}
