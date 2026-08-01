"use client";
import { useState } from "react";
import Link from "next/link";
import Header from "@/components/Header";
import Footer from "@/components/Footer";

const FAQS = [
  { q: "Как выбрать ноутбук?", a: "Всё зависит от ваших задач и бюджета. Для офиса и учёбы подойдут ноутбуки с Intel Core i5/Ryzen 5 и 8–16 ГБ RAM. Для игр нужна дискретная видеокарта RTX. Для дизайна важен качественный экран. Наши специалисты бесплатно помогут подобрать модель — напишите нам в WhatsApp!" },
  { q: "Есть ли гарантия на ноутбуки?", a: "Да! На всю технику распространяется гарантия 1 год. У нас также есть собственный сервисный центр для быстрого решения любых гарантийных случаев." },
  { q: "Есть ли доставка по Казахстану?", a: "Да! Доставляем по всему Казахстану. По Алматы — бесплатная доставка курьером. По другим регионам Казахстана — транспортными компаниями СДЭК и inDrive со страховкой груза." },
  { q: "Можно ли проверить товар перед покупкой?", a: "Конечно! Приходите в наш магазин по адресу: г. Алматы, пр. Абылай хана, ТЦ Алтын-Тараз, 1 этаж, магазин 32-33. Мы продемонстрируем работу ноутбука и поможем с выбором. Работаем ежедневно с 10:00 до 20:00." },
  { q: "Как оформить заказ?", a: "Вы можете: 1) Нажать кнопку «Купить» или «Заказать в WhatsApp» на странице товара, 2) Написать нам в WhatsApp +7 (707) 551-19-79, 3) Позвонить по тому же номеру, 4) Прийти в наш магазин." },
  { q: "Какие способы оплаты доступны?", a: "Наличные, банковская карта (Visa/Mastercard), Kaspi Pay, банковский перевод." },
  { q: "Что делать если ноутбук сломался?", a: "Обратитесь к нам любым удобным способом: позвоните, напишите в WhatsApp или придите в магазин. Мы проведём бесплатную диагностику и определим, является ли случай гарантийным." },
  { q: "Есть ли скидки для постоянных клиентов?", a: "Да! Для постоянных клиентов действуют специальные условия. Подпишитесь на наш WhatsApp или Instagram, чтобы первыми узнавать об акциях и эксклюзивных предложениях." },
];

export default function FAQPage() {
  const [open, setOpen] = useState<number | null>(null);

  return (
    <>
      <Header />
      <div className="page-hero">
        <div className="wrap">
          <div className="breadcrumbs">
            <Link href="/">Главная</Link>
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" width="14" height="14"><path d="M9 18l6-6-6-6"/></svg>
            <span>FAQ</span>
          </div>
          <h1>❓ Частые вопросы</h1>
          <p>Ответы на самые популярные вопросы о покупке ноутбуков в OnePoint.</p>
        </div>
      </div>

      <section className="info-section">
        <div className="wrap" style={{ maxWidth: 860 }}>
          <div style={{ marginBottom: 48 }}>
            {FAQS.map((faq, i) => (
              <div key={i} className="faq-item">
                <div className="faq-question" onClick={() => setOpen(open === i ? null : i)}>
                  <span>{faq.q}</span>
                  <span className={`faq-icon${open === i ? " open" : ""}`} style={{ fontSize: 22, fontWeight: 300 }}>+</span>
                </div>
                <div className={`faq-answer${open === i ? " open" : ""}`}>{faq.a}</div>
              </div>
            ))}
          </div>

          {/* Still have questions */}
          <div style={{ background: "linear-gradient(135deg,#0D0D11,#1B1710)", borderRadius: 24, padding: 40, textAlign: "center", color: "#fff" }}>
            <h3 style={{ fontSize: 26, fontWeight: 800, marginBottom: 12 }}>Не нашли ответ?</h3>
            <p style={{ color: "rgba(255,255,255,.65)", fontSize: 15, marginBottom: 24 }}>Напишите нам — ответим быстро!</p>
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
