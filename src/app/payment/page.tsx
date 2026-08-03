import Link from "next/link";
import Header from "@/components/Header";
import Footer from "@/components/Footer";

function IconCash() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" width="40" height="40">
      <rect x="2" y="6" width="20" height="14" rx="3"/>
      <circle cx="12" cy="13" r="3"/>
      <path d="M6 10h.01M18 10h.01M6 16h.01M18 16h.01"/>
    </svg>
  );
}
function IconCard() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" width="40" height="40">
      <rect x="2" y="5" width="20" height="14" rx="2"/>
      <line x1="2" y1="10" x2="22" y2="10"/>
      <line x1="6" y1="15" x2="10" y2="15"/>
    </svg>
  );
}
function IconQR() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" width="40" height="40">
      <rect x="3" y="3" width="7" height="7" rx="1"/>
      <rect x="14" y="3" width="7" height="7" rx="1"/>
      <rect x="3" y="14" width="7" height="7" rx="1"/>
      <path d="M14 14h3v3h-3zM17 17h3v3h-3zM14 20h3"/>
      <path d="M5 5h3v3H5zM16 5h3v3h-3zM5 16h3v3H5z" fill="currentColor" stroke="none"/>
    </svg>
  );
}
function IconBank() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" width="40" height="40">
      <path d="M3 9l9-7 9 7"/>
      <path d="M4 10v9h16v-9"/>
      <path d="M8 10v9M12 10v9M16 10v9"/>
      <line x1="2" y1="19" x2="22" y2="19"/>
    </svg>
  );
}

const PAYMENT_METHODS = [
  { Icon: IconCash, title: "Наличные",          desc: "При получении курьером или в магазине" },
  { Icon: IconBank, title: "Переводы",          desc: "Переводы на карту или банковский счет" },
];

export default function PaymentPage() {
  return (
    <>
      <Header />
      <div className="page-hero">
        <div className="wrap">
          <div className="breadcrumbs">
            <Link href="/">Главная</Link>
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" width="14" height="14"><path d="M9 18l6-6-6-6"/></svg>
            <span>Оплата</span>
          </div>
          <h1>Способы оплаты</h1>
          <p>Оплачивайте покупки любым удобным способом в магазине OnePoint.</p>
        </div>
      </div>

      <section className="info-section">
        <div className="wrap">
          {/* Payment methods */}
          <h2 style={{ fontSize: 28, fontWeight: 800, marginBottom: 24 }}>Способы оплаты</h2>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(4,1fr)", gap: 20, marginBottom: 56 }} className="payment-methods-grid">
            {PAYMENT_METHODS.map(({ Icon, title, desc }) => (
              <div key={title} style={{ background: "#fff", border: "1.5px solid var(--border)", borderRadius: 20, padding: 28, textAlign: "center" }}>
                <span style={{
                  display: "inline-flex", alignItems: "center", justifyContent: "center",
                  width: 72, height: 72, borderRadius: 20,
                  background: "linear-gradient(135deg,#edfaf3,#d1fae5)",
                  color: "var(--success)", marginBottom: 16,
                }}>
                  <Icon />
                </span>
                <h3 style={{ fontSize: 17, fontWeight: 700, marginBottom: 8 }}>{title}</h3>
                <p style={{ fontSize: 13.5, color: "var(--text-muted)", lineHeight: 1.5 }}>{desc}</p>
              </div>
            ))}
          </div>

          <div style={{ background: "linear-gradient(135deg,#0D0D11,#1B1710)", borderRadius: 24, padding: 40, textAlign: "center", color: "#fff" }}>
            <h3 style={{ fontSize: 26, fontWeight: 800, marginBottom: 12 }}>Появились вопросы по оплате?</h3>
            <p style={{ color: "rgba(255,255,255,.65)", fontSize: 15, marginBottom: 24 }}>Свяжитесь с нами, наш менеджер подробно проконсультирует вас.</p>
            <div style={{ display: "flex", gap: 12, justifyContent: "center", flexWrap: "wrap" }}>
              <a href="https://wa.me/77075511979" target="_blank" rel="noopener noreferrer" className="btn btn-green">Написать в WhatsApp</a>
              <a href="tel:+77075511979" className="btn btn-light">Позвонить</a>
            </div>
          </div>
        </div>
      </section>

      <Footer />
    </>
  );
}
