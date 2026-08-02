import Link from "next/link";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import ProductCard from "@/components/ProductCard";
import { fetchLiveProductsByFlag } from "@/lib/data";

export const revalidate = 0;

export default async function NewArrivalsPage() {
  const newProducts = await fetchLiveProductsByFlag("is_new");

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
          <h1>Новинки 2025</h1>
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

          {newProducts.length === 0 ? (
            <div style={{ padding: "40px 0", color: "var(--text-muted)", fontSize: 14 }}>Загрузка новинок...</div>
          ) : (
            <div className="product-grid">
              {newProducts.map(p => <ProductCard key={p.id} product={p} />)}
            </div>
          )}

          {/* What's new section */}
          <div style={{ marginTop: 72, background: "linear-gradient(135deg,#0D0D11,#1B1710)", borderRadius: 28, padding: "48px 40px", color: "#fff", overflow: "hidden" }} className="new-tech-section">
            <div className="eyebrow" style={{ color: "var(--accent)" }}>Технологии 2025</div>
            <h2 style={{ fontSize: 32, fontWeight: 800, marginBottom: 32, letterSpacing: "-.02em" }}>Что нового в ноутбуках 2025 года</h2>
            <div className="new-tech-grid" style={{ display: "grid", gridTemplateColumns: "repeat(3,1fr)", gap: 24 }}>
              {[
                { icon: <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" width="24" height="24"><rect x="2" y="6" width="20" height="12" rx="2"/><path d="M6 12h4m-2-2v4m10-2h.01m-3 0h.01"/></svg>, title: "RTX 50xx Series", desc: "Новое поколение NVIDIA GeForce RTX 5060/5070/5080 — до 70% прироста в играх по сравнению с RTX 40xx" },
                { icon: <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" width="24" height="24"><path d="M13 2L3 14h9l-1 8 10-12h-9l1-8z"/></svg>, title: "Intel Core Ultra 200HX", desc: "Гибридная архитектура, встроенный NPU для AI-задач, до 24 ядер и Thunderbolt 4" },
                { icon: <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" width="24" height="24"><path d="M5 12.55a11 11 0 0 1 14.08 0M1.42 9a16 16 0 0 1 21.16 0M8.53 16.11a6 6 0 0 1 6.95 0M12 20h.01"/></svg>, title: "Wi-Fi 7", desc: "Скорость до 46 Гбит/с, минимальные задержки для игр и стриминга в 4K" },
                { icon: <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" width="24" height="24"><rect x="2" y="4" width="20" height="16" rx="2"/><path d="M6 10h4M6 14h12"/></svg>, title: "PCIe Gen 5 NVMe", desc: "SSD нового поколения — скорость чтения до 14 000 МБ/с, вдвое быстрее Gen 4" },
                { icon: <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" width="24" height="24"><rect x="2" y="3" width="20" height="14" rx="2"/><path d="M8 21h8m-4-4v4"/></svg>, title: "Mini-LED и OLED", desc: "Матрицы с высочайшим контрастом, яркостью до 2000 нит и 240 Гц частотой" },
                { icon: <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" width="24" height="24"><rect x="3" y="11" width="18" height="10" rx="2"/><circle cx="12" cy="5" r="2"/><path d="M12 7v4M8 16h.01M16 16h.01"/></svg>, title: "AI-функции", desc: "Встроенные NPU для фоновый шумоподавления, суперразрешения и умного энергопотребления" },
              ].map(item => (
                <div key={item.title} style={{ background: "rgba(255,255,255,.06)", borderRadius: 16, padding: 24 }}>
                  <div style={{ width: 44, height: 44, borderRadius: 12, background: "rgba(255,90,31,.15)", color: "var(--accent)", display: "flex", alignItems: "center", justifyContent: "center", marginBottom: 16 }}>
                    {item.icon}
                  </div>
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
