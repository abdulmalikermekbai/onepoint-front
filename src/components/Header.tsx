"use client";
import { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { trackEvent } from "@/lib/analytics";

const NAV = [
  { href: "/catalog", label: "Каталог" },
  { href: "/bestsellers", label: "Хиты" },
  { href: "/promotions", label: "Акции" },
  { href: "/new-arrivals", label: "Новинки" },
  { href: "/contacts", label: "Контакты" },
  { href: "/favorites", label: "Избранное" },
];

const CAT_CHIPS = [
  { href: "/catalog", label: "Все", icon: "◉" },
  { href: "/catalog?cat=gaming", label: "Игровые" },
  { href: "/catalog?cat=office", label: "Для работы" },
  { href: "/catalog?cat=ultrabook", label: "Ультрабуки" },
  { href: "/catalog?cat=macbook", label: "MacBook" },
  { href: "/catalog?cat=designer", label: "Для дизайна" },
  { href: "/catalog?cat=rtx", label: "RTX 50xx" },
  { href: "/catalog?cat=oled", label: "OLED" },
  { href: "/delivery", label: "Доставка" },
];

export default function Header() {
  const router = useRouter();
  const [scrolled, setScrolled] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [search, setSearch] = useState("");

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 8);
    window.addEventListener("scroll", onScroll);
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  const [announcement, setAnnouncement] = useState("ONEPOINT.KZ | Новые запечатанные ноутбуки с гарантией 1 год · Видео-проверка · Бесплатная подготовка (Windows / Office)");

  useEffect(() => {
    import("@/lib/data").then(({ fetchSettings }) => {
      fetchSettings().then(settings => {
        if (settings.header_announcement) {
          setAnnouncement(settings.header_announcement);
        }
      });
    }).catch(() => {});
  }, []);

  return (
    <>
      {/* Announcement */}
      <div className="announce">
        <span className="announce-desktop">{announcement}</span>
        <span className="announce-mobile">
          Новые запечатанные ноутбуки с гарантией 1 год · Бесплатная подготовка (Windows / Office)
        </span>
      </div>

      {/* Main Header */}
      <header className={`site-header${scrolled ? " scrolled" : ""}`}>
        <div className="wrap header-row">
          {/* Hamburger (mobile) */}
          <button className="hamburger" onClick={() => setMobileOpen(true)} aria-label="Меню">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M3 12h18M3 6h18M3 18h18" />
            </svg>
          </button>

          <Link href="/" prefetch={false} className="logo">
            <span className="dot" />
            OnePoint
          </Link>

          <nav className="nav-main">
            {NAV.map((n) => (
              <Link key={n.href} href={n.href} prefetch={false}>{n.label}</Link>
            ))}
          </nav>

          <form
            className="searchbar"
            onSubmit={(e) => {
              e.preventDefault();
              if (search.trim()) {
                const targetUrl = `/catalog?q=${encodeURIComponent(search.trim())}`;
                router.push(targetUrl);
              }
            }}
          >
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
              <circle cx="11" cy="11" r="7" />
              <path d="m21 21-4.3-4.3" />
            </svg>
            <input
              type="text"
              placeholder="Найти ноутбук, бренд или модель…"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </form>

          <div className="header-actions">
            <Link href="/favorites" prefetch={false} className="phone-header-btn" title="Избранное" style={{ padding: "10px", width: "40px", height: "40px", borderRadius: "50%", display: "flex", alignItems: "center", justifyContent: "center" }}>
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" width="18" height="18">
                <path d="M20.8 4.6a5.5 5.5 0 0 0-7.8 0L12 5.6l-1-1a5.5 5.5 0 1 0-7.8 7.8l1 1L12 21l7.8-7.6 1-1a5.5 5.5 0 0 0 0-7.8Z" />
              </svg>
            </Link>
            <a
              href="tel:+77075511979"
              className="phone-header-btn"
              onClick={() => trackEvent('click_phone', { source: 'header' })}
            >
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" width="18" height="18">
                <path d="M22 16.9v3a2 2 0 0 1-2.2 2 19.8 19.8 0 0 1-8.6-3.1 19.5 19.5 0 0 1-6-6A19.8 19.8 0 0 1 2.1 4.2 2 2 0 0 1 4.1 2h3a2 2 0 0 1 2 1.7c.1.9.3 1.8.6 2.7a2 2 0 0 1-.5 2.1L8 9.7a16 16 0 0 0 6 6l1.2-1.2a2 2 0 0 1 2.1-.5c.9.3 1.8.5 2.7.6a2 2 0 0 1 1.7 2Z" />
              </svg>
              <span>+7 (707) 551-19-79</span>
            </a>
            <a
              href="https://wa.me/77075511979?text=Здравствуйте!%20Хочу%20проконсультироваться%20по%20ноутбукам."
              target="_blank"
              rel="noopener noreferrer"
              className="whatsapp-header-btn"
              onClick={() => trackEvent('click_whatsapp', { source: 'header' })}
            >
              <svg viewBox="0 0 24 24" fill="currentColor">
                <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347z" />
                <path d="M12 0C5.373 0 0 5.373 0 12c0 2.125.556 4.122 1.528 5.855L.057 23.082a1 1 0 0 0 1.224 1.3l5.396-1.416A11.942 11.942 0 0 0 12 24c6.627 0 12-5.373 12-12S18.627 0 12 0zm0 22c-1.896 0-3.665-.522-5.176-1.432l-.361-.217-3.742.981.999-3.648-.235-.374A9.96 9.96 0 0 1 2 12C2 6.477 6.477 2 12 2s10 4.477 10 10-4.477 10-10 10z" />
              </svg>
              <span>WhatsApp</span>
            </a>
          </div>
        </div>

        {/* Category Strip */}
        <div className="cat-strip">
          <div className="wrap" style={{ padding: "12px 40px" }}>
            {CAT_CHIPS.map((c) => (
              <Link key={c.href} href={c.href} prefetch={false} className="cat-chip">
                {c.label}
              </Link>
            ))}
          </div>
        </div>
      </header>

      {/* Mobile Nav */}
      <div className={`mobile-nav-overlay${mobileOpen ? " open" : ""}`} onClick={() => setMobileOpen(false)} />
      <div className={`mobile-nav-panel${mobileOpen ? " open" : ""}`}>
        <div className="mobile-nav-header">
          <Link href="/" prefetch={false} className="logo" onClick={() => setMobileOpen(false)}>
            <span className="dot" />
            OnePoint
          </Link>
          <button className="modal-close" onClick={() => setMobileOpen(false)} style={{ position: "static" }}>
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M18 6 6 18M6 6l12 12" />
            </svg>
          </button>
        </div>
        <div className="mobile-nav-links">
          {NAV.map((n) => (
            <Link key={n.href} href={n.href} prefetch={false} onClick={() => setMobileOpen(false)}>
              {n.label}
            </Link>
          ))}
          <Link href="/delivery" prefetch={false} onClick={() => setMobileOpen(false)}>Доставка</Link>
          <Link href="/guarantee" prefetch={false} onClick={() => setMobileOpen(false)}>Гарантия</Link>
          <Link href="/about" prefetch={false} onClick={() => setMobileOpen(false)}>О компании</Link>
          <Link href="/faq" prefetch={false} onClick={() => setMobileOpen(false)}>FAQ</Link>
          <div style={{ marginTop: 16, padding: "0 12px" }}>
            <a
              href="https://wa.me/77075511979"
              target="_blank"
              rel="noopener noreferrer"
              className="btn btn-green"
              style={{ width: "100%", borderRadius: 12 }}
            >
              WhatsApp консультация
            </a>
          </div>
        </div>
      </div>

      <style>{`
        @media(max-width:960px){
          .hamburger { display:flex !important; }
          .whatsapp-header-btn span { display:none; }
          .phone-header-btn span { display:none; }
          .header-actions { margin-left: auto; gap: 6px; }
          .whatsapp-header-btn { padding: 10px !important; width: 40px; height: 40px; border-radius: 50% !important; justify-content: center; }
          .phone-header-btn { padding: 10px !important; width: 40px; height: 40px; border-radius: 50% !important; justify-content: center; }
        }
        @media(max-width:680px){
          .searchbar { display:none !important; }
          .site-header .wrap.header-row { padding-left: 12px; padding-right: 12px; }
        }
      `}</style>
    </>
  );
}
