import Link from "next/link";
import Header from "@/components/Header";
import Footer from "@/components/Footer";

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
          <h1>💳 Способы оплаты</h1>
          <p>Оплачивайте покупки любым удобным способом в магазине OnePoint.</p>
        </div>
      </div>

      <section className="info-section">
        <div className="wrap">
          {/* Payment methods */}
          <h2 style={{ fontSize: 28, fontWeight: 800, marginBottom: 24 }}>Способы оплаты</h2>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(4,1fr)", gap: 20, marginBottom: 56 }}>
            {[
              { icon: "💵", title: "Наличные", desc: "При получении курьером или в магазине" },
              { icon: "💳", title: "Банковская карта", desc: "Visa, Mastercard. Оплата на сайте или через терминал" },
              { icon: "📱", title: "Kaspi Pay", desc: "Быстрая оплата через QR в приложении Kaspi" },
              { icon: "🏦", title: "Банковский перевод", desc: "Счёт на оплату для Halyk, Kaspi, Forte и др." },
            ].map(m => (
              <div key={m.title} style={{ background: "#fff", border: "1.5px solid var(--border)", borderRadius: 20, padding: 28, textAlign: "center" }}>
                <span style={{ fontSize: 48, display: "block", marginBottom: 12 }}>{m.icon}</span>
                <h3 style={{ fontSize: 17, fontWeight: 700, marginBottom: 8 }}>{m.title}</h3>
                <p style={{ fontSize: 13.5, color: "var(--text-muted)", lineHeight: 1.5 }}>{m.desc}</p>
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
