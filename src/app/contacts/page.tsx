"use client";
import { useState, useEffect } from "react";
import Link from "next/link";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { fetchSettings } from "@/lib/data";

export default function ContactsPage() {
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [message, setMessage] = useState("");
  const [sent, setSent] = useState(false);
  const [settings, setSettings] = useState<Record<string, string>>({});

  useEffect(() => {
    fetchSettings().then(setSettings).catch(() => {});
  }, []);

  const shopPhone = settings.shop_phone || "+7 (707) 551-19-79";
  const shopPhoneClean = shopPhone.replace(/[^\d+]/g, "");
  const shopWorkHours = settings.shop_work_hours || "Ежедневно: 10:00 – 20:00";
  const shopAddress = settings.shop_address || "г. Алматы, проспект Абылай хана, ТЦ Алтын-Тараз, 1 этаж, магазин 32-33";

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    await fetch("/api/lead", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ type: "contact", name, phone, message }),
    }).catch(() => {});
    setSent(true);
  };

  return (
    <>
      <Header />
      <div className="page-hero">
        <div className="wrap">
          <div className="breadcrumbs">
            <Link href="/">Главная</Link>
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" width="14" height="14"><path d="M9 18l6-6-6-6"/></svg>
            <span>Контакты</span>
          </div>
          <h1>Контакты</h1>
          <p>Свяжитесь с нами любым удобным способом. Работаем ежедневно с {shopWorkHours.replace("Ежедневно: ", "")}.</p>
        </div>
      </div>

      <section className="info-section" style={{ paddingBottom: 80 }}>
        <div className="wrap">
          <div className="contacts-grid" style={{ marginBottom: 48 }}>
            {/* Contact cards */}
            <div>
              <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
                <a href={`tel:${shopPhoneClean}`} className="contact-card">
                  <div className="contact-icon">
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" width="26" height="26">
                      <path d="M22 16.9v3a2 2 0 0 1-2.2 2 19.8 19.8 0 0 1-8.6-3.1 19.5 19.5 0 0 1-6-6A19.8 19.8 0 0 1 2.1 4.2 2 2 0 0 1 4.1 2h3a2 2 0 0 1 2 1.7c.1.9.3 1.8.6 2.7a2 2 0 0 1-.5 2.1L8 9.7a16 16 0 0 0 6 6l1.2-1.2a2 2 0 0 1 2.1-.5c.9.3 1.8.5 2.7.6a2 2 0 0 1 1.7 2Z" />
                    </svg>
                  </div>
                  <div>
                    <div style={{ fontWeight: 700, fontSize: 15, marginBottom: 4, color: "var(--text-muted)" }}>Телефон</div>
                    <div style={{ fontSize: 20, fontWeight: 800 }}>{shopPhone}</div>
                    <div style={{ fontSize: 13, color: "var(--text-muted)", marginTop: 4 }}>{shopWorkHours}</div>
                  </div>
                </a>
                <a href={`https://wa.me/${shopPhoneClean}`} target="_blank" rel="noopener noreferrer" className="contact-card">
                  <div className="contact-icon" style={{ background: "#f0fdf4" }}>
                    <svg viewBox="0 0 24 24" fill="#25D366" width="26" height="26">
                      <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347z"/>
                      <path d="M12 0C5.373 0 0 5.373 0 12c0 2.125.556 4.122 1.528 5.855L.057 23.082a1 1 0 0 0 1.224 1.3l5.396-1.416A11.942 11.942 0 0 0 12 24c6.627 0 12-5.373 12-12S18.627 0 12 0zm0 22c-1.896 0-3.665-.522-5.176-1.432l-.361-.217-3.742.981.999-3.648-.235-.374A9.96 9.96 0 0 1 2 12C2 6.477 6.477 2 12 2s10 4.477 10 10-4.477 10-10 10z"/>
                    </svg>
                  </div>
                  <div>
                    <div style={{ fontWeight: 700, fontSize: 15, marginBottom: 4, color: "var(--text-muted)" }}>WhatsApp</div>
                    <div style={{ fontSize: 20, fontWeight: 800 }}>{shopPhone}</div>
                    <div style={{ fontSize: 13, color: "var(--text-muted)", marginTop: 4 }}>Быстрый ответ в мессенджере</div>
                  </div>
                </a>
                <a href="https://www.instagram.com/onepoint.kz/" target="_blank" rel="noopener noreferrer" className="contact-card">
                  <div className="contact-icon" style={{ background: "rgba(225, 48, 108, 0.1)" }}>
                    <svg viewBox="0 0 24 24" fill="none" stroke="#E1306C" strokeWidth="2" width="26" height="26">
                      <rect x="2" y="2" width="20" height="20" rx="5" ry="5"/>
                      <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"/>
                      <line x1="17.5" y1="6.5" x2="17.51" y2="6.5"/>
                    </svg>
                  </div>
                  <div>
                    <div style={{ fontWeight: 700, fontSize: 15, marginBottom: 4, color: "var(--text-muted)" }}>Instagram</div>
                    <div style={{ fontSize: 20, fontWeight: 800 }}>@onepoint.kz</div>
                    <div style={{ fontSize: 13, color: "#E1306C", marginTop: 4, fontWeight: 700 }}>instagram.com/onepoint.kz</div>
                  </div>
                </a>
                <a href="mailto:info@onepoint.kz" className="contact-card">
                  <div className="contact-icon">
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" width="26" height="26">
                      <path d="M4 4h16v16H4z" /><path d="m22 6-10 7L2 6" />
                    </svg>
                  </div>
                  <div>
                    <div style={{ fontWeight: 700, fontSize: 15, marginBottom: 4, color: "var(--text-muted)" }}>Email</div>
                    <div style={{ fontSize: 20, fontWeight: 800 }}>info@onepoint.kz</div>
                    <div style={{ fontSize: 13, color: "var(--text-muted)", marginTop: 4 }}>Ответим в течение часа</div>
                  </div>
                </a>
                <div className="contact-card" style={{ cursor: "default" }}>
                  <div className="contact-icon">
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" width="26" height="26">
                      <path d="M21 10c0 7-9 12-9 12s-9-5-9-12a9 9 0 0 1 18 0Z" /><circle cx="12" cy="10" r="3" />
                    </svg>
                  </div>
                  <div>
                    <div style={{ fontWeight: 700, fontSize: 15, marginBottom: 4, color: "var(--text-muted)" }}>Адрес магазина</div>
                    <div style={{ fontSize: 16, fontWeight: 700 }}>г. Алматы</div>
                    <div style={{ fontSize: 14, color: "var(--text-muted)", marginTop: 2 }} dangerouslySetInnerHTML={{ __html: shopAddress.replace(/\n/g, "<br/>") + "<br/>" + shopWorkHours }} />
                  </div>
                </div>
              </div>
            </div>

            {/* Contact form */}
            <div style={{ background: "var(--surface)", borderRadius: 24, padding: "32px 24px" }}>
              {sent ? (
                <div style={{ textAlign: "center", padding: "40px 0" }}>
                  <div style={{ width: 56, height: 56, borderRadius: "50%", background: "var(--success-tint)", color: "var(--success)", display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 16px" }}>
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" width="28" height="28">
                      <polyline points="20 6 9 17 4 12" />
                    </svg>
                  </div>
                  <h3 style={{ fontSize: 22, fontWeight: 800, marginBottom: 8 }}>Сообщение отправлено!</h3>
                  <p style={{ color: "var(--text-muted)", fontSize: 15 }}>Мы свяжемся с вами в ближайшее время.</p>
                </div>
              ) : (
                <>
                  <h2 style={{ fontSize: 24, fontWeight: 800, marginBottom: 6 }}>Написать нам</h2>
                  <p style={{ color: "var(--text-muted)", fontSize: 14, marginBottom: 28 }}>Задайте вопрос по наличию или характеристикам:</p>
                  <form onSubmit={handleSubmit}>
                    <div className="form-group">
                      <label className="form-label">Ваше имя</label>
                      <input className="form-input" type="text" placeholder="Имя и фамилия" value={name} onChange={e => setName(e.target.value)} required />
                    </div>
                    <div className="form-group">
                      <label className="form-label">Телефон</label>
                      <input className="form-input" type="tel" placeholder="+7 (___) ___-__-__" value={phone} onChange={e => setPhone(e.target.value)} required />
                    </div>
                    <div className="form-group">
                      <label className="form-label">Сообщение</label>
                      <textarea className="form-input form-textarea" placeholder="Опишите ваш вопрос или запрос…" value={message} onChange={e => setMessage(e.target.value)} required />
                    </div>
                    <button type="submit" className="btn btn-primary" style={{ width: "100%", padding: 16, fontSize: 16 }}>Отправить сообщение</button>
                  </form>
                </>
              )}
            </div>
          </div>

          {/* 2GIS Map Block */}
          <div style={{ background: "#fff", borderRadius: 24, border: "1px solid var(--border)", boxShadow: "0 12px 32px rgba(0,0,0,0.06)", overflow: "hidden" }}>
            <div style={{ padding: "24px", display: "flex", flexWrap: "wrap", justifyContent: "space-between", alignItems: "center", gap: 16, borderBottom: "1px solid var(--border)", background: "var(--surface)" }}>
              <div>
                <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 4 }}>
                  <span style={{ background: "#65a30d", color: "#fff", padding: "4px 10px", borderRadius: 8, fontSize: 12, fontWeight: 800 }}>2GIS</span>
                  <h3 style={{ fontSize: 20, fontWeight: 800, margin: 0 }}>Наш адрес в 2ГИС</h3>
                </div>
                <div style={{ fontSize: 14, color: "var(--text-muted)" }}>г. Алматы, пр. Абылай хана, ТЦ Алтын-Тараз (2 этаж, бутик 20)</div>
              </div>
              <div style={{ display: "flex", gap: 12, flexWrap: "wrap" }}>
                <a
                  href="https://go.2gis.com/aduOr"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="btn btn-primary"
                  style={{ display: "inline-flex", alignItems: "center", gap: 8, padding: "12px 20px", borderRadius: 12, textDecoration: "none" }}
                >
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" width="18" height="18">
                    <path d="M12 22s-8-4.5-8-11.8A8 8 0 0 1 12 2a8 8 0 0 1 8 8.2c0 7.3-8 11.8-8 11.8z" />
                    <circle cx="12" cy="10" r="3" />
                  </svg>
                  Открыть в 2ГИС
                </a>
              </div>
            </div>

            <div style={{ width: "100%", minHeight: 320, position: "relative", background: "radial-gradient(circle at 50% 50%, #f0fdf4 0%, #e8f5e9 100%)", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", padding: 24, textAlign: "center" }}>
              <div style={{ width: 56, height: 56, borderRadius: "50%", background: "#65a30d", color: "#fff", display: "flex", alignItems: "center", justifyContent: "center", marginBottom: 16, boxShadow: "0 8px 24px rgba(101,163,13,0.3)" }}>
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" width="28" height="28">
                  <path d="M12 22s-8-4.5-8-11.8A8 8 0 0 1 12 2a8 8 0 0 1 8 8.2c0 7.3-8 11.8-8 11.8z" />
                  <circle cx="12" cy="10" r="3" />
                </svg>
              </div>
              <h4 style={{ fontSize: 20, fontWeight: 800, marginBottom: 8, color: "#1b4332" }}>
                Магазин OnePoint на карте 2ГИС
              </h4>
              <p style={{ color: "var(--text-muted)", maxWidth: 500, fontSize: 14, lineHeight: 1.5, marginBottom: 20 }}>
                г. Алматы, пр. Абылай хана, ТЦ Алтын-Тараз, 2 этаж, бутик 20. Постройте точный маршрут в приложении или браузере.
              </p>
              <a
                href="https://go.2gis.com/aduOr"
                target="_blank"
                rel="noopener noreferrer"
                className="btn btn-primary"
                style={{ padding: "14px 28px", fontSize: 15, fontWeight: 700, borderRadius: 100 }}
              >
                Построить маршрут в 2ГИС
              </a>
            </div>
          </div>
        </div>
      </section>

      <Footer />
    </>
  );
}

