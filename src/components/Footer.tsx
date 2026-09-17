"use client";
import Link from "next/link";
import { useState, useEffect } from "react";
import { fetchLiveBrands, BRANDS } from "@/lib/data";

function DynamicFooterBrands() {
  const [brands, setBrands] = useState<{name: string, slug: string}[]>(BRANDS.slice(0, 8));

  useEffect(() => {
    fetchLiveBrands().then(list => {
      if (list && list.length > 0) {
        setBrands(list.slice(0, 8));
      }
    }).catch(() => {});
  }, []);

  return (
    <>
      {brands.map((b) => (
        <li key={b.slug}>
          <Link href={`/catalog?brand=${b.slug}`} prefetch={false}>{b.name}</Link>
        </li>
      ))}
    </>
  );
}

export default function Footer() {
  return (
    <footer>
      <div className="wrap">
        <div className="footer-top">
          {/* Brand */}
          <div>
            <div className="footer-logo">
              <span className="dot" />
              OnePoint
            </div>
            <p className="footer-about">
              Премиальный магазин оригинальных ноутбуков в Казахстане. Гарантия 1 год, экспертный подбор и сервис мирового уровня.
            </p>
            <div className="footer-social">
              <a href="https://www.instagram.com/onepoint.kz/" target="_blank" rel="noopener noreferrer" title="Instagram">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <rect x="3" y="3" width="18" height="18" rx="5" />
                  <circle cx="12" cy="12" r="4" />
                  <circle cx="17.5" cy="6.5" r="1" />
                </svg>
              </a>
              <a href="https://wa.me/77075511979" target="_blank" rel="noopener noreferrer" title="WhatsApp">
                <svg viewBox="0 0 24 24" fill="currentColor" style={{ color: "#fff" }}>
                  <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347z" />
                  <path d="M12 0C5.373 0 0 5.373 0 12c0 2.125.556 4.122 1.528 5.855L.057 23.082a1 1 0 0 0 1.224 1.3l5.396-1.416A11.942 11.942 0 0 0 12 24c6.627 0 12-5.373 12-12S18.627 0 12 0zm0 22c-1.896 0-3.665-.522-5.176-1.432l-.361-.217-3.742.981.999-3.648-.235-.374A9.96 9.96 0 0 1 2 12C2 6.477 6.477 2 12 2s10 4.477 10 10-4.477 10-10 10z" />
                </svg>
              </a>
              <a href="https://youtube.com" target="_blank" rel="noopener noreferrer" title="YouTube">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <rect x="2" y="5" width="20" height="14" rx="4" />
                  <path d="m10 9 5 3-5 3Z" />
                </svg>
              </a>
              <a href="https://t.me/onepoint_kz" target="_blank" rel="noopener noreferrer" title="Telegram">
                <svg viewBox="0 0 24 24" fill="currentColor" style={{ color: "#fff" }}>
                  <path d="M12 0C5.373 0 0 5.373 0 12s5.373 12 12 12 12-5.373 12-12S18.627 0 12 0zm5.562 8.248-2.04 9.617c-.15.698-.551.868-1.116.54l-3.085-2.272-1.488 1.433c-.165.164-.303.302-.62.302l.22-3.148 5.713-5.16c.248-.22-.054-.343-.385-.123L7.24 14.613l-3.037-.95c-.66-.207-.672-.66.138-.977l11.865-4.572c.55-.2 1.032.134.856.955.001-.001 0-.001-.5 .179z" />
                </svg>
              </a>
            </div>
          </div>

          {/* Catalog */}
          <div className="footer-col">
            <h4>Каталог</h4>
            <ul>
              <li><Link href="/catalog?cat=gaming" prefetch={false}>Игровые ноутбуки</Link></li>
              <li><Link href="/catalog?cat=office" prefetch={false}>Для работы</Link></li>
              <li><Link href="/catalog?cat=ultrabook" prefetch={false}>Ультрабуки</Link></li>
              <li><Link href="/catalog?cat=macbook" prefetch={false}>MacBook</Link></li>
              <li><Link href="/catalog?cat=designer" prefetch={false}>Для дизайнеров</Link></li>
              <li><Link href="/catalog?cat=rtx" prefetch={false}>Ноутбуки с RTX</Link></li>
              <li><Link href="/promotions" prefetch={false}>Акции</Link></li>
              <li><Link href="/new-arrivals" prefetch={false}>Новинки 2026</Link></li>
            </ul>
          </div>

          {/* Info */}
          <div className="footer-col">
            <h4>Компания</h4>
            <ul>
              <li><Link href="/about" prefetch={false}>О нас</Link></li>
              <li><Link href="/contacts" prefetch={false}>Контакты</Link></li>
              <li><Link href="/delivery" prefetch={false}>Доставка</Link></li>
              <li><Link href="/payment" prefetch={false}>Оплата</Link></li>
              <li><Link href="/guarantee" prefetch={false}>Гарантия</Link></li>
              <li><Link href="/faq" prefetch={false}>FAQ</Link></li>
              <li><Link href="/privacy" prefetch={false}>Политика</Link></li>
            </ul>
          </div>

          {/* Brands */}
          <div className="footer-col">
            <h4>Популярные бренды</h4>
            <ul>
              <DynamicFooterBrands />
            </ul>
          </div>

          {/* Contact */}
          <div className="footer-col">
            <h4>Контакты</h4>
            <ul className="footer-contact">
              <li>
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M22 16.9v3a2 2 0 0 1-2.2 2 19.8 19.8 0 0 1-8.6-3.1 19.5 19.5 0 0 1-6-6A19.8 19.8 0 0 1 2.1 4.2 2 2 0 0 1 4.1 2h3a2 2 0 0 1 2 1.7c.1.9.3 1.8.6 2.7a2 2 0 0 1-.5 2.1L8 9.7a16 16 0 0 0 6 6l1.2-1.2a2 2 0 0 1 2.1-.5c.9.3 1.8.5 2.7.6a2 2 0 0 1 1.7 2Z" />
                </svg>
                <span>+7 (707) 551-19-79</span>
              </li>
              <li>
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M4 4h16v16H4z" />
                  <path d="m22 6-10 7L2 6" />
                </svg>
                <span>info@onepoint.kz</span>
              </li>
              <li>
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M21 10c0 7-9 12-9 12s-9-5-9-12a9 9 0 0 1 18 0Z" />
                  <circle cx="12" cy="10" r="3" />
                </svg>
                <span>г. Алматы, пр. Абылай хана, ТЦ Алтын-Тараз, 1 этаж, магазин 32-33</span>
              </li>
              <li>
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <circle cx="12" cy="12" r="10" />
                  <path d="M12 6v6l4 2" />
                </svg>
                <span>Ежедневно 10:00–20:00</span>
              </li>
            </ul>
          </div>
        </div>

        <div className="footer-bottom">
          <span>© 2026 OnePoint. Все права защищены.</span>
          <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
            <Link href="/privacy" prefetch={false} style={{ fontSize: 12.5, color: "rgba(255,255,255,.35)", transition: "color .2s" }}>
              Политика конфиденциальности
            </Link>
          </div>

        </div>
      </div>
    </footer>
  );
}
