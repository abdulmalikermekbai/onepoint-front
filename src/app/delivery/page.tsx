import Link from "next/link";
import Header from "@/components/Header";
import Footer from "@/components/Footer";

export default function DeliveryPage() {
  return (
    <>
      <Header />
      <div className="page-hero">
        <div className="wrap">
          <div className="breadcrumbs">
            <Link href="/">Главная</Link>
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" width="14" height="14"><path d="M9 18l6-6-6-6"/></svg>
            <span>Доставка</span>
          </div>
          <h1>🚚 Доставка</h1>
          <p>Доставляем ноутбуки по всему Казахстану быстро и надёжно.</p>
        </div>
      </div>

      <section className="info-section">
        <div className="wrap">
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 24, marginBottom: 48 }}>
            {[
              { icon: "🚀", title: "По Алматы", price: "Бесплатно от 200 000 ₸", days: "В день заказа или на следующий день", desc: "Курьер доставит ноутбук, распакует при вас и поможет с первоначальной настройкой." },
              { icon: "📦", title: "По Казахстану", price: "Бесплатно от 200 000 ₸", days: "2–5 рабочих дней", desc: "Доставляем во все города Казахстана транспортными компаниями СДЭК, Kaspi Доставка, Пакет.кз." },
              { icon: "🏪", title: "Самовывоз", price: "Бесплатно", days: "Готово за 30 минут", desc: "Заберите ноутбук в нашем магазине в ТЦ Алтын-Тараз, Алматы. Проверьте устройство перед покупкой." },
            ].map(d => (
              <div key={d.title} style={{ background: "#fff", border: "1.5px solid var(--border)", borderRadius: 20, padding: 32, display: "flex", flexDirection: "column", gap: 12 }}>
                <span style={{ fontSize: 48 }}>{d.icon}</span>
                <h3 style={{ fontSize: 22, fontWeight: 800 }}>{d.title}</h3>
                <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
                  <span style={{ background: "var(--success-tint)", color: "var(--success)", padding: "4px 12px", borderRadius: 100, fontSize: 13, fontWeight: 700 }}>{d.price}</span>
                  <span style={{ background: "var(--surface)", padding: "4px 12px", borderRadius: 100, fontSize: 13, fontWeight: 600, color: "var(--text-muted)" }}>{d.days}</span>
                </div>
                <p style={{ fontSize: 14.5, color: "var(--text-muted)", lineHeight: 1.6 }}>{d.desc}</p>
              </div>
            ))}
          </div>

          {/* Steps */}
          <h2 style={{ fontSize: 28, fontWeight: 800, marginBottom: 24 }}>Как оформить заказ</h2>
          {[
            { step: 1, title: "Выберите ноутбук", desc: "Просмотрите каталог или обратитесь к нашему консультанту для подбора модели." },
            { step: 2, title: "Оформите заказ", desc: "Нажмите «Купить», «Заказать в WhatsApp» или позвоните нам по телефону." },
            { step: 3, title: "Подтверждение", desc: "Наш менеджер свяжется с вами в течение 15 минут для подтверждения заказа." },
            { step: 4, title: "Оплата и доставка", desc: "Выберите удобный способ оплаты. Курьер доставит ноутбук в указанный срок." },
          ].map(s => (
            <div key={s.step} className="step-card">
              <div className="step-num">{s.step}</div>
              <div>
                <h3 style={{ fontSize: 18, fontWeight: 700, marginBottom: 6 }}>{s.title}</h3>
                <p style={{ fontSize: 14.5, color: "var(--text-muted)", lineHeight: 1.6 }}>{s.desc}</p>
              </div>
            </div>
          ))}

          {/* Address */}
          <div style={{ marginTop: 48, background: "var(--surface)", borderRadius: 24, padding: 40 }}>
            <h2 style={{ fontSize: 26, fontWeight: 800, marginBottom: 20 }}>Наш адрес</h2>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 24 }}>
              <div>
                <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
                  <div style={{ display: "flex", gap: 12 }}>
                    <span style={{ fontSize: 24 }}>📍</span>
                    <div>
                      <div style={{ fontWeight: 700, marginBottom: 4 }}>OnePoint</div>
                      <div style={{ color: "var(--text-muted)", fontSize: 15 }}>г. Алматы, проспект Абылай хана<br />ТЦ Алтын-Тараз, 2 этаж, бутик 20</div>
                    </div>
                  </div>
                  <div style={{ display: "flex", gap: 12 }}>
                    <span style={{ fontSize: 24 }}>🕐</span>
                    <div>
                      <div style={{ fontWeight: 700, marginBottom: 4 }}>Время работы</div>
                      <div style={{ color: "var(--text-muted)", fontSize: 15 }}>Ежедневно: 10:00 – 19:00</div>
                    </div>
                  </div>
                  <div style={{ display: "flex", gap: 12 }}>
                    <span style={{ fontSize: 24 }}>📞</span>
                    <div>
                      <div style={{ fontWeight: 700, marginBottom: 4 }}>Телефон</div>
                      <a href="tel:+77075511979" style={{ color: "var(--accent)", fontSize: 15, fontWeight: 600 }}>+7 (707) 551-19-79</a>
                    </div>
                  </div>
                </div>
              </div>
              <div style={{ background: "#e8e8ec", borderRadius: 16, display: "flex", alignItems: "center", justifyContent: "center", minHeight: 200, fontSize: 40 }}>
                🗺️
                <div style={{ marginLeft: 16, fontWeight: 600, fontSize: 16 }}>Карта скоро будет</div>
              </div>
            </div>
          </div>

          {/* CTA */}
          <div style={{ marginTop: 40, textAlign: "center" }}>
            <a href="https://wa.me/77075511979?text=Здравствуйте!%20Хочу%20оформить%20заказ%20с%20доставкой." target="_blank" rel="noopener noreferrer" className="btn btn-green" style={{ fontSize: 17, padding: "18px 40px" }}>
              <svg viewBox="0 0 24 24" fill="currentColor" width="20" height="20">
                <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347z"/>
                <path d="M12 0C5.373 0 0 5.373 0 12c0 2.125.556 4.122 1.528 5.855L.057 23.082a1 1 0 0 0 1.224 1.3l5.396-1.416A11.942 11.942 0 0 0 12 24c6.627 0 12-5.373 12-12S18.627 0 12 0zm0 22c-1.896 0-3.665-.522-5.176-1.432l-.361-.217-3.742.981.999-3.648-.235-.374A9.96 9.96 0 0 1 2 12C2 6.477 6.477 2 12 2s10 4.477 10 10-4.477 10-10 10z"/>
              </svg>
              Оформить заказ через WhatsApp
            </a>
          </div>
        </div>
      </section>

      <Footer />
    </>
  );
}
