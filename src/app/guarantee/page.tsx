import Link from "next/link";
import Header from "@/components/Header";
import Footer from "@/components/Footer";

export default function GuaranteePage() {
  return (
    <>
      <Header />
      <div className="page-hero">
        <div className="wrap">
          <div className="breadcrumbs">
            <Link href="/">Главная</Link>
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" width="14" height="14"><path d="M9 18l6-6-6-6"/></svg>
            <span>Гарантия</span>
          </div>
          <h1>🛡️ Гарантия</h1>
          <p>Гарантия 1 год на всю технику. Собственный сервисный центр для быстрого решения любых вопросов.</p>
        </div>
      </div>

      <section className="info-section">
        <div className="wrap">
          {/* Main guarantee block */}
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 24, marginBottom: 48 }}>
            <div style={{ background: "linear-gradient(135deg,#1AA35C,#16a34a)", borderRadius: 24, padding: 40, color: "#fff" }}>
              <span style={{ fontSize: 56, display: "block", marginBottom: 16 }}>🛡️</span>
              <h2 style={{ fontSize: 28, fontWeight: 800, marginBottom: 12 }}>Гарантия 1 год</h2>
              <p style={{ fontSize: 15.5, opacity: .9, lineHeight: 1.6 }}>
                Мы работаем только с официальными поставщиками. На всю технику предоставляется гарантия 1 год.
              </p>
              <div style={{ marginTop: 24, display: "flex", gap: 20 }}>
                <div style={{ textAlign: "center" }}>
                  <div style={{ fontSize: 32, fontWeight: 900 }}>1</div>
                  <div style={{ fontSize: 13, opacity: .8 }}>год гарантии</div>
                </div>
                <div style={{ width: 1, background: "rgba(255,255,255,.2)" }} />
                <div style={{ textAlign: "center" }}>
                  <div style={{ fontSize: 32, fontWeight: 900 }}>24/7</div>
                  <div style={{ fontSize: 13, opacity: .8 }}>поддержка</div>
                </div>
                <div style={{ width: 1, background: "rgba(255,255,255,.2)" }} />
                <div style={{ textAlign: "center" }}>
                  <div style={{ fontSize: 32, fontWeight: 900 }}>100%</div>
                  <div style={{ fontSize: 13, opacity: .8 }}>оригиналы</div>
                </div>
              </div>
            </div>
            <div style={{ background: "var(--surface)", borderRadius: 24, padding: 40 }}>
              <h3 style={{ fontSize: 22, fontWeight: 800, marginBottom: 20 }}>Что покрывает гарантия</h3>
              {["Производственные дефекты экрана", "Неисправности аккумулятора", "Проблемы с материнской платой", "Дефекты клавиатуры и тачпада", "Неисправности разъёмов и портов", "Программные сбои системы"].map(item => (
                <div key={item} style={{ display: "flex", gap: 10, alignItems: "center", padding: "10px 0", borderBottom: "1px solid var(--border)" }}>
                  <span style={{ color: "var(--success)", fontWeight: 700 }}>✓</span>
                  <span style={{ fontSize: 15 }}>{item}</span>
                </div>
              ))}
            </div>
          </div>

          {/* What is NOT covered */}
          <div className="info-card" style={{ borderLeft: "4px solid var(--warn)" }}>
            <h3>Случаи, не входящие в гарантию</h3>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8, marginTop: 12 }}>
              {["Механические повреждения (удары, падения)", "Повреждения от жидкостей", "Самостоятельный ремонт", "Вирусы и программные ошибки"].map(item => (
                <div key={item} style={{ display: "flex", gap: 8, alignItems: "center", fontSize: 14.5, color: "var(--text-muted)" }}>
                  <span style={{ color: "#EF4444" }}>✗</span>
                  {item}
                </div>
              ))}
            </div>
          </div>

          {/* Service process */}
          <h2 style={{ fontSize: 26, fontWeight: 800, margin: "48px 0 24px" }}>Как обратиться по гарантии</h2>
          {[
            { step: 1, title: "Обратитесь к нам", desc: "Позвоните, напишите в WhatsApp или придите в магазин." },
            { step: 2, title: "Диагностика", desc: "Наши специалисты проведут бесплатную диагностику устройства." },
            { step: 3, title: "Решение", desc: "Ремонт, замена или возврат средств в зависимости от ситуации." },
            { step: 4, title: "Выдача", desc: "Получите отремонтированный ноутбук или новое устройство." },
          ].map(s => (
            <div key={s.step} className="step-card">
              <div className="step-num">{s.step}</div>
              <div>
                <h3 style={{ fontSize: 18, fontWeight: 700, marginBottom: 6 }}>{s.title}</h3>
                <p style={{ fontSize: 14.5, color: "var(--text-muted)", lineHeight: 1.6 }}>{s.desc}</p>
              </div>
            </div>
          ))}

          <div style={{ marginTop: 40, textAlign: "center" }}>
            <a href="https://wa.me/77075511979?text=Здравствуйте!%20У%20меня%20гарантийный%20случай." target="_blank" rel="noopener noreferrer" className="btn btn-green" style={{ fontSize: 16, padding: "16px 36px" }}>
              Написать по гарантийному случаю
            </a>
          </div>
        </div>
      </section>

      <Footer />
    </>
  );
}
