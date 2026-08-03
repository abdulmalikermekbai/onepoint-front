import Link from "next/link";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import ProductCard from "@/components/ProductCard";
import { fetchLiveProductsByFlag, formatPrice } from "@/lib/data";

export const revalidate = 0;

function IcoGift() {
  return <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" width="36" height="36"><path d="M20 12v10H4V12"/><path d="M22 7H2v5h20V7z"/><path d="M12 22V7"/><path d="M12 7H7.5a2.5 2.5 0 0 1 0-5C11 2 12 7 12 7z"/><path d="M12 7h4.5a2.5 2.5 0 0 0 0-5C13 2 12 7 12 7z"/></svg>;
}
function IcoSale() {
  return <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" width="36" height="36"><path d="M12.22 2h-.44a2 2 0 0 0-2 2v.18a2 2 0 0 1-1 1.73l-.43.25a2 2 0 0 1-2 0l-.15-.08a2 2 0 0 0-2.73.73l-.22.38a2 2 0 0 0 .73 2.73l.15.1a2 2 0 0 1 1 1.72v.51a2 2 0 0 1-1 1.74l-.15.09a2 2 0 0 0-.73 2.73l.22.38a2 2 0 0 0 2.73.73l.15-.08a2 2 0 0 1 2 0l.43.25a2 2 0 0 1 1 1.73V20a2 2 0 0 0 2 2h.44a2 2 0 0 0 2-2v-.18a2 2 0 0 1 1-1.73l.43-.25a2 2 0 0 1 2 0l.15.08a2 2 0 0 0 2.73-.73l.22-.39a2 2 0 0 0-.73-2.73l-.15-.08a2 2 0 0 1-1-1.74v-.5a2 2 0 0 1 1-1.74l.15-.09a2 2 0 0 0 .73-2.73l-.22-.38a2 2 0 0 0-2.73-.73l-.15.08a2 2 0 0 1-2 0l-.43-.25a2 2 0 0 1-1-1.73V4a2 2 0 0 0-2-2z"/><circle cx="12" cy="12" r="3"/></svg>;
}
function IcoDelivery() {
  return <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" width="36" height="36"><rect x="1" y="3" width="15" height="13" rx="1"/><path d="M16 8h4l3 4v3h-7V8z"/><circle cx="5.5" cy="18.5" r="2.5"/><circle cx="18.5" cy="18.5" r="2.5"/></svg>;
}


export default async function PromotionsPage() {
  const saleProducts = await fetchLiveProductsByFlag("is_sale");

  return (
    <>
      <Header />
      <div className="page-hero">
        <div className="wrap">
          <div className="breadcrumbs">
            <Link href="/">Главная</Link>
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" width="14" height="14"><path d="M9 18l6-6-6-6"/></svg>
            <span>Акции</span>
          </div>
          <h1>Акции и спецпредложения</h1>
          <p>Скидки на лучшие модели ноутбуков. Ограниченное количество по акционной цене.</p>
        </div>
      </div>

      <section>
        <div className="wrap">
          {/* Promo banners */}
          <div className="promotions-banners-grid" style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 20, marginBottom: 56 }}>
            {[
              { Icon: IcoGift,     tag: "Подарок",  title: "Полезный аксессуар к выбранным ноутбукам", desc: "Уточняйте комплект у консультанта",                    bg: "linear-gradient(135deg,#FF7A3D,#FF5A1F,#E64A12)", href: "https://wa.me/77075511979?text=Хочу%20узнать%20про%20подарок%20к%20ноутбуку" },
              { Icon: IcoSale,     tag: "Спеццена", title: "Скидки на популярные ноутбуки из наличия",   desc: "Количество товаров по акции ограничено",           bg: "linear-gradient(135deg,#1B1B21,#0D0D11)",         href: "/catalog?sale=1" },
              { Icon: IcoDelivery, tag: "Доставка", title: "Бесплатная доставка по Алматы",              desc: "По Алматы бесплатно курьером · По Казахстану СДЭК / inDrive",bg: "linear-gradient(135deg,#1a2e6e,#0d0d11)",         href: "/delivery" },
            ].map((promo) => (
              <a
                key={promo.tag}
                href={promo.href}
                style={{
                  background: promo.bg,
                  borderRadius: 20,
                  padding: "32px 28px",
                  color: "#fff",
                  display: "flex",
                  flexDirection: "column",
                  gap: 12,
                  minHeight: 200,
                  transition: "transform .3s, box-shadow .3s",
                }}
              >
                <span style={{ display: "inline-flex", opacity: 0.9, marginBottom: 4 }}><promo.Icon /></span>
                <span style={{ background: "rgba(255,255,255,.18)", borderRadius: 100, padding: "4px 12px", fontSize: 12, fontWeight: 700, alignSelf: "flex-start" }}>{promo.tag}</span>
                <h3 style={{ fontSize: 20, fontWeight: 800, lineHeight: 1.2 }}>{promo.title}</h3>
                <p style={{ fontSize: 14, opacity: .8 }}>{promo.desc}</p>
              </a>
            ))}
          </div>

          {/* Sale products */}
          <div className="section-head">
            <div>
              <div className="eyebrow">Товары со скидкой</div>
              <h2 className="section-title">Акционные ноутбуки</h2>
              <p className="section-sub">Успейте купить по выгодной цене</p>
            </div>
          </div>

          {saleProducts.length === 0 ? (
            <div style={{ padding: "40px 0", color: "var(--text-muted)", fontSize: 14 }}>Загрузка акций...</div>
          ) : (
            <div className="product-grid">
              {saleProducts.map(p => <ProductCard key={p.id} product={p} />)}
            </div>
          )}

          {/* Savings table */}
          {saleProducts.length > 0 && (
            <div style={{ marginTop: 64, background: "var(--surface)", borderRadius: 24, padding: 40 }} className="savings-section">
              <h2 style={{ fontSize: 26, fontWeight: 800, marginBottom: 24 }}>Топ экономии</h2>

              {/* Desktop table */}
              <table className="promotions-savings-table" style={{ width: "100%", borderCollapse: "collapse" }}>
                <thead>
                  <tr style={{ borderBottom: "2px solid var(--border)" }}>
                    {["Модель", "Старая цена", "Новая цена", "Скидка", "Экономия", ""].map(h => (
                      <th key={h} style={{ padding: "12px 16px", textAlign: "left", fontSize: 13, fontWeight: 700, color: "var(--text-muted)", textTransform: "uppercase", letterSpacing: ".04em" }}>{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {[...saleProducts].sort((a, b) => (b.saving || 0) - (a.saving || 0)).map(p => (
                    <tr key={p.id} style={{ borderBottom: "1px solid var(--border)" }}>
                      <td style={{ padding: "14px 16px", fontWeight: 600, fontSize: 14 }}>
                        <Link href={`/product/${p.slug}`} style={{ color: "var(--text)", transition: "color .2s" }}>{p.brand} {p.name.split(" ").slice(1, 5).join(" ")}</Link>
                      </td>
                      <td style={{ padding: "14px 16px", textDecoration: "line-through", color: "var(--text-muted)", fontSize: 14 }}>{p.oldPrice ? formatPrice(p.oldPrice) : "—"}</td>
                      <td style={{ padding: "14px 16px", fontWeight: 800, fontSize: 15 }}>{formatPrice(p.price)}</td>
                      <td style={{ padding: "14px 16px" }}><span className="discount-badge">-{p.discountPercent || 0}%</span></td>
                      <td style={{ padding: "14px 16px", color: "var(--success)", fontWeight: 700 }}>{p.saving ? formatPrice(p.saving) : "—"}</td>
                      <td style={{ padding: "14px 16px" }}>
                        <a href={`https://wa.me/77075511979?text=Хочу%20купить:%20${encodeURIComponent(p.name)}`} target="_blank" rel="noopener noreferrer" className="btn btn-green btn-xs">WhatsApp</a>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>

              {/* Mobile cards — shown only on mobile via CSS */}
              <div className="promotions-savings-cards">
                {[...saleProducts].sort((a, b) => (b.saving || 0) - (a.saving || 0)).map(p => (
                  <div key={p.id} style={{ borderBottom: "1px solid var(--border)", padding: "16px 0", display: "flex", alignItems: "center", justifyContent: "space-between", gap: 12 }}>
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <Link href={`/product/${p.slug}`} style={{ fontWeight: 700, fontSize: 13.5, color: "var(--text)", display: "block", marginBottom: 4, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                        {p.brand} {p.name.split(" ").slice(1, 4).join(" ")}
                      </Link>
                      <div style={{ display: "flex", alignItems: "center", gap: 8, flexWrap: "wrap" }}>
                        <span style={{ fontWeight: 800, fontSize: 14 }}>{formatPrice(p.price)}</span>
                        {p.oldPrice && <span style={{ textDecoration: "line-through", color: "var(--text-soft)", fontSize: 12 }}>{formatPrice(p.oldPrice)}</span>}
                        <span className="discount-badge">-{p.discountPercent || 0}%</span>
                      </div>
                    </div>
                    <a href={`https://wa.me/77075511979?text=Хочу%20купить:%20${encodeURIComponent(p.name)}`} target="_blank" rel="noopener noreferrer" className="btn btn-green btn-xs" style={{ flexShrink: 0, fontSize: 12, padding: "8px 14px" }}>WA</a>
                  </div>
                ))}
              </div>
            </div>
          )}

        </div>
      </section>

      <Footer />
    </>
  );
}
