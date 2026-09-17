import Link from "next/link";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { fetchSettings } from "@/lib/data";

export const revalidate = 60;

export default async function DeliveryPage() {
  const settings = await fetchSettings();

  const almatyPrice = settings.delivery_almaty_price || "Платная доставка курьером";
  const almatyDays = settings.delivery_almaty_days || "В день заказа или на следующий день";
  const almatyDesc = settings.delivery_almaty_desc || "Курьер доставит ноутбук, распакует при вас и поможет с первоначальной настройкой.";

  const kzPrice = settings.delivery_kazakhstan_price || "По тарифам ТК";
  const kzDays = settings.delivery_kazakhstan_days || "2–5 рабочих дней";
  const kzDesc = settings.delivery_kazakhstan_desc || "Доставляем во все города Казахстана со страховкой транспортными компаниями СДЭК и Индрайв.";

  const pickupPrice = settings.delivery_pickup_price || "Бесплатно";
  const pickupDays = settings.delivery_pickup_days || "Готово за 30 минут";
  const pickupDesc = settings.delivery_pickup_desc || "Заберите ноутбук в нашем магазине в ТЦ Алтын-Тараз, Алматы. Проверьте устройство перед покупкой.";

  const shopPhone = settings.shop_phone || "+7 (707) 551-19-79";
  const shopPhoneClean = shopPhone.replace(/[^\d+]/g, "");
  const shopWorkHours = settings.shop_work_hours || "Ежедневно: 10:00 – 20:00";
  const shopAddress = settings.shop_address || "г. Алматы, проспект Абылай хана, ТЦ Алтын-Тараз, 2 этаж, бутик 20";
  const shop2gis = settings.shop_2gis || "https://go.2gis.com/aduOr";

  return (
    <>
      <Header />
      <div className="page-hero">
        <div className="wrap">
          <div className="breadcrumbs">
            <Link href="/" prefetch={false}>Главная</Link>
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" width="14" height="14"><path d="M9 18l6-6-6-6"/></svg>
            <span>Доставка</span>
          </div>
          <h1>Доставка</h1>
          <p>Доставляем ноутбуки по всему Казахстану быстро и надёжно.</p>
        </div>
      </div>

      <section className="info-section">
        <div className="wrap">
          <div className="delivery-methods-grid" style={{ marginBottom: 48 }}>
            {[
              {
                icon: (
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" width="28" height="28">
                    <path d="M13 2L3 14h9l-1 8 10-12h-9l1-8z" />
                  </svg>
                ),
                title: "По Алматы",
                price: almatyPrice,
                days: almatyDays,
                desc: almatyDesc
              },
              {
                icon: (
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" width="28" height="28">
                    <path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z" />
                    <polyline points="3.27 6.96 12 12.01 20.73 6.96" />
                    <line x1="12" y1="22.08" x2="12" y2="12" />
                  </svg>
                ),
                title: "По Казахстану",
                price: kzPrice,
                days: kzDays,
                desc: kzDesc
              },
              {
                icon: (
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" width="28" height="28">
                    <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" />
                    <polyline points="9 22 9 12 15 12 15 22" />
                  </svg>
                ),
                title: "Самовывоз",
                price: pickupPrice,
                days: pickupDays,
                desc: pickupDesc
              },
            ].map(d => (
              <div key={d.title} style={{ background: "#fff", border: "1.5px solid var(--border)", borderRadius: 20, padding: 28, display: "flex", flexDirection: "column", gap: 12 }}>
                <div style={{ width: 52, height: 52, borderRadius: 14, background: "var(--accent-tint)", color: "var(--accent)", display: "flex", alignItems: "center", justifyContent: "center" }}>
                  {d.icon}
                </div>
                <h3 style={{ fontSize: 20, fontWeight: 800 }}>{d.title}</h3>
                <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
                  <span style={{ background: "var(--success-tint)", color: "var(--success)", padding: "4px 12px", borderRadius: 100, fontSize: 12.5, fontWeight: 700 }}>{d.price}</span>
                  <span style={{ background: "var(--surface)", padding: "4px 12px", borderRadius: 100, fontSize: 12.5, fontWeight: 600, color: "var(--text-muted)" }}>{d.days}</span>
                </div>
                <p style={{ fontSize: 14, color: "var(--text-muted)", lineHeight: 1.6 }}>{d.desc}</p>
              </div>
            ))}
          </div>

          {/* Steps */}
          <h2 style={{ fontSize: 26, fontWeight: 800, marginBottom: 24 }}>Как оформить заказ</h2>
          {[
            { step: 1, title: "Выберите ноутбук", desc: "Просмотрите каталог или обратитесь к нашему консультанту для подбора модели." },
            { step: 2, title: "Оформите заказ", desc: "Нажмите «Заказать в WhatsApp» или позвоните нам по телефону." },
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
          <div style={{ marginTop: 48, background: "var(--surface)", borderRadius: 24, padding: 32 }}>
            <h2 style={{ fontSize: 24, fontWeight: 800, marginBottom: 20 }}>Наш адрес</h2>
            <div className="contacts-grid">
              <div>
                <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
                  <div style={{ display: "flex", gap: 12, alignItems: "flex-start" }}>
                    <div style={{ width: 36, height: 36, borderRadius: 10, background: "var(--accent-tint)", color: "var(--accent)", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" width="20" height="20">
                        <path d="M21 10c0 7-9 12-9 12s-9-5-9-12a9 9 0 0 1 18 0Z" />
                        <circle cx="12" cy="10" r="3" />
                      </svg>
                    </div>
                    <div>
                      <div style={{ fontWeight: 700, marginBottom: 4 }}>OnePoint</div>
                      <div style={{ color: "var(--text-muted)", fontSize: 14.5 }} dangerouslySetInnerHTML={{ __html: shopAddress.replace(/\n/g, "<br/>") }} />
                    </div>
                  </div>
                  <div style={{ display: "flex", gap: 12, alignItems: "flex-start" }}>
                    <div style={{ width: 36, height: 36, borderRadius: 10, background: "var(--accent-tint)", color: "var(--accent)", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" width="20" height="20">
                        <circle cx="12" cy="12" r="10" />
                        <polyline points="12 6 12 12 16 14" />
                      </svg>
                    </div>
                    <div>
                      <div style={{ fontWeight: 700, marginBottom: 4 }}>Время работы</div>
                      <div style={{ color: "var(--text-muted)", fontSize: 14.5 }}>{shopWorkHours}</div>
                    </div>
                  </div>
                  <div style={{ display: "flex", gap: 12, alignItems: "flex-start" }}>
                    <div style={{ width: 36, height: 36, borderRadius: 10, background: "var(--accent-tint)", color: "var(--accent)", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" width="20" height="20">
                        <path d="M22 16.9v3a2 2 0 0 1-2.2 2 19.8 19.8 0 0 1-8.6-3.1 19.5 19.5 0 0 1-6-6A19.8 19.8 0 0 1 2.1 4.2 2 2 0 0 1 4.1 2h3a2 2 0 0 1 2 1.7c.1.9.3 1.8.6 2.7a2 2 0 0 1-.5 2.1L8 9.7a16 16 0 0 0 6 6l1.2-1.2a2 2 0 0 1 2.1-.5c.9.3 1.8.5 2.7.6a2 2 0 0 1 1.7 2Z" />
                      </svg>
                    </div>
                    <div>
                      <div style={{ fontWeight: 700, marginBottom: 4 }}>Телефон</div>
                      <a href={`tel:${shopPhoneClean}`} style={{ color: "var(--accent)", fontSize: 14.5, fontWeight: 700 }}>{shopPhone}</a>
                    </div>
                  </div>
                </div>
              </div>
              <div style={{ background: "#fff", border: "1px solid var(--border)", borderRadius: 16, padding: 24, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", minHeight: 180, textAlign: "center" }}>
                <a href={shop2gis} target="_blank" rel="noopener noreferrer" className="btn btn-primary btn-sm">
                  Открыть местоположение в 2ГИС
                </a>
              </div>
            </div>
          </div>

          {/* CTA */}
          <div style={{ marginTop: 40, textAlign: "center" }}>
            <a href={`https://wa.me/${shopPhoneClean}?text=${encodeURIComponent("Здравствуйте! Хочу оформить заказ с доставкой.")}`} target="_blank" rel="noopener noreferrer" className="btn btn-green" style={{ fontSize: 17, padding: "18px 40px" }}>
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
