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
          <h1>💳 Оплата и рассрочка</h1>
          <p>Оплачивайте любым удобным способом. Рассрочка 0% на 12 месяцев без переплат.</p>
        </div>
      </div>

      <section className="info-section">
        <div className="wrap">
          {/* Payment methods */}
          <h2 style={{ fontSize: 28, fontWeight: 800, marginBottom: 24 }}>Способы оплаты</h2>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(4,1fr)", gap: 20, marginBottom: 56 }}>
            {[
              { icon: "💵", title: "Наличные", desc: "При получении курьером или в магазине" },
              { icon: "💳", title: "Банковская карта", desc: "Visa, Mastercard, мир. Оплата на сайте или терминале" },
              { icon: "📱", title: "Kaspi Pay", desc: "Быстрая оплата через приложение Kaspi" },
              { icon: "🏦", title: "Банковский перевод", desc: "Halyk, Kaspi, Forte и другие банки" },
            ].map(m => (
              <div key={m.title} style={{ background: "#fff", border: "1.5px solid var(--border)", borderRadius: 20, padding: 28, textAlign: "center" }}>
                <span style={{ fontSize: 48, display: "block", marginBottom: 12 }}>{m.icon}</span>
                <h3 style={{ fontSize: 17, fontWeight: 700, marginBottom: 8 }}>{m.title}</h3>
                <p style={{ fontSize: 13.5, color: "var(--text-muted)", lineHeight: 1.5 }}>{m.desc}</p>
              </div>
            ))}
          </div>

          {/* Installment */}
          <div style={{ background: "linear-gradient(135deg,#0D0D11,#1B1710)", borderRadius: 28, padding: 48, color: "#fff", marginBottom: 48 }}>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 48, alignItems: "center" }}>
              <div>
                <div className="eyebrow" style={{ color: "var(--accent)" }}>Рассрочка</div>
                <h2 style={{ fontSize: 34, fontWeight: 800, letterSpacing: "-.02em", marginBottom: 16, lineHeight: 1.1 }}>
                  Рассрочка 0-0-12 без переплат
                </h2>
                <p style={{ color: "rgba(255,255,255,.7)", fontSize: 15.5, lineHeight: 1.6, marginBottom: 24 }}>
                  Любой ноутбук в рассрочку на 12 месяцев без первого взноса и переплат. Оформление онлайн за 5 минут через банки-партнёры.
                </p>
                <div style={{ display: "flex", gap: 12 }}>
                  <a href="https://wa.me/77075511979?text=Хочу%20оформить%20рассрочку%20на%20ноутбук." target="_blank" rel="noopener noreferrer" className="btn btn-green">Оформить рассрочку</a>
                </div>
              </div>
              <div>
                {[
                  ["Первый взнос", "0%"],
                  ["Переплата", "0%"],
                  ["Срок", "3, 6, 12 месяцев"],
                  ["Одобрение", "от 5 минут"],
                  ["Документы", "Только удостоверение"],
                ].map(([label, val]) => (
                  <div key={label} style={{ display: "flex", justifyContent: "space-between", padding: "14px 0", borderBottom: "1px solid rgba(255,255,255,.1)" }}>
                    <span style={{ color: "rgba(255,255,255,.6)", fontSize: 14 }}>{label}</span>
                    <span style={{ fontWeight: 700, fontSize: 15 }}>{val}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Bank partners */}
          <h2 style={{ fontSize: 24, fontWeight: 800, marginBottom: 20 }}>Банки-партнёры</h2>
          <div style={{ display: "flex", gap: 16, flexWrap: "wrap", marginBottom: 48 }}>
            {["Kaspi Bank", "Halyk Bank", "ForteBank", "Jusan Bank", "Bank CenterCredit", "Home Credit"].map(b => (
              <div key={b} style={{ background: "var(--surface)", borderRadius: 12, padding: "14px 24px", fontWeight: 700, fontSize: 15 }}>{b}</div>
            ))}
          </div>

          {/* Trade-in */}
          <div style={{ background: "linear-gradient(135deg,#FF7A3D,#FF5A1F)", borderRadius: 24, padding: 40, color: "#fff" }}>
            <h2 style={{ fontSize: 26, fontWeight: 800, marginBottom: 12 }}>🔄 Trade-In — сдайте старый ноутбук</h2>
            <p style={{ fontSize: 15, opacity: .9, marginBottom: 24, maxWidth: 540, lineHeight: 1.6 }}>
              Оценим ваш ноутбук бесплатно и вычтем его стоимость из цены нового. Скидка до 30% при Trade-In!
            </p>
            <a href="https://wa.me/77075511979?text=Здравствуйте!%20Хочу%20узнать%20стоимость%20Trade-In%20своего%20ноутбука." target="_blank" rel="noopener noreferrer" className="btn btn-dark">Узнать стоимость Trade-In</a>
          </div>
        </div>
      </section>

      <Footer />
    </>
  );
}
