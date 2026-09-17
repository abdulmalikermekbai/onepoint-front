"use client";
import Link from "next/link";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { CATEGORIES } from "@/lib/data";

/* ─── SVG icon library ─── */
function IcoGaming()  { return <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" width="36" height="36"><rect x="2" y="7" width="20" height="14" rx="4"/><path d="M9 14h6M12 11v6" strokeLinecap="round"/><circle cx="18" cy="5" r="3" fill="currentColor" stroke="none" opacity=".3"/><circle cx="18" cy="5" r="1.5" fill="currentColor" stroke="none"/></svg>; }
function IcoOffice()  { return <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" width="36" height="36"><rect x="2" y="3" width="20" height="14" rx="2"/><path d="M8 21h8M12 17v4"/></svg>; }
function IcoStudent() { return <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" width="36" height="36"><path d="M22 10v1a10 10 0 0 1-10 10A10 10 0 0 1 2 11v-1l10-5 10 5z"/><path d="M6 12v5c1.5 1.5 8.5 1.5 12 0v-5"/></svg>; }
function IcoUltra()   { return <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" width="36" height="36"><path d="M13 2L3 14h9l-1 8 10-12h-9l1-8z" strokeLinejoin="round"/></svg>; }
function IcoApple()   { return <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" width="36" height="36"><path d="M12 5c-1 0-3-1-3-3 0 2-2 3-3 3 2 0 3 2 3 4 0-2 2-4 3-4z"/><path d="M17 8c-1.5 0-5-1.5-5-4 0 2.5-3.5 4-5 4 2 0 5 2 5 5v7h2V13c0-3 3-5 5-5h-2z" opacity=".5"/><path d="M6.5 8C4 8 2 10.5 2 13.5 2 18 5 22 8 22h8c3 0 6-4 6-8.5C22 10.5 20 8 17.5 8" strokeLinecap="round"/></svg>; }
function IcoDesign()  { return <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" width="36" height="36"><circle cx="12" cy="12" r="10"/><circle cx="12" cy="12" r="3"/><path d="M12 2v3M12 19v3M2 12h3M19 12h3" strokeLinecap="round"/></svg>; }
function IcoDev()     { return <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" width="36" height="36"><polyline points="16 18 22 12 16 6"/><polyline points="8 6 2 12 8 18"/></svg>; }
function IcoVideo()   { return <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" width="36" height="36"><polygon points="23 7 16 12 23 17 23 7"/><rect x="1" y="5" width="15" height="14" rx="2"/></svg>; }
function IcoRTX()     { return <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" width="36" height="36"><rect x="2" y="4" width="20" height="14" rx="2"/><path d="M8 18v4M16 18v4M6 22h12" strokeLinecap="round"/><path d="M7 9h4v6H7zM15 9l2 3-2 3" strokeLinejoin="round"/></svg>; }
function IcoOLED()    { return <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" width="36" height="36"><circle cx="12" cy="12" r="5"/><path d="M12 1v3M12 20v3M4.22 4.22l2.12 2.12M17.66 17.66l2.12 2.12M1 12h3M20 12h3M4.22 19.78l2.12-2.12M17.66 6.34l2.12-2.12" strokeLinecap="round"/></svg>; }
function IcoBusiness(){ return <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" width="36" height="36"><path d="M20 7H4a2 2 0 0 0-2 2v10a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2V9a2 2 0 0 0-2-2z"/><path d="M16 7V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v2"/><line x1="12" y1="12" x2="12" y2="17"/><line x1="9" y1="14.5" x2="15" y2="14.5"/></svg>; }
function IcoAccessory(){ return <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" width="36" height="36"><path d="M5 3h14a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2z"/><path d="M9 3v18M15 3v18M3 9h18M3 15h18"/></svg>; }
function IcoLaptop()  { return <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" width="36" height="36"><rect x="2" y="3" width="20" height="14" rx="2"/><path d="M0 21h24" strokeLinecap="round"/></svg>; }

// Purpose-section icons
function IcoStudyPurp()    { return <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" width="30" height="30"><path d="M22 10v1a10 10 0 0 1-10 10A10 10 0 0 1 2 11v-1l10-5 10 5z"/><path d="M6 12v5c1.5 1.5 8.5 1.5 12 0v-5"/></svg>; }
function IcoOfficePurp()   { return <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" width="30" height="30"><rect x="2" y="3" width="20" height="14" rx="2"/><path d="M8 21h8M12 17v4"/></svg>; }
function IcoDevPurp()      { return <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" width="30" height="30"><polyline points="16 18 22 12 16 6"/><polyline points="8 6 2 12 8 18"/></svg>; }
function IcoGamingPurp()   { return <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" width="30" height="30"><rect x="2" y="7" width="20" height="14" rx="4"/><path d="M9 14h6M12 11v6" strokeLinecap="round"/></svg>; }
function IcoVideoPurp()    { return <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" width="30" height="30"><polygon points="23 7 16 12 23 17 23 7"/><rect x="1" y="5" width="15" height="14" rx="2"/></svg>; }
function Ico3DPurp()       { return <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" width="30" height="30"><path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z"/><polyline points="3.27 6.96 12 12.01 20.73 6.96"/><line x1="12" y1="22.08" x2="12" y2="12"/></svg>; }
function IcoDesignPurp()   { return <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" width="30" height="30"><circle cx="12" cy="12" r="10"/><circle cx="12" cy="12" r="3"/></svg>; }
function IcoTravelPurp()   { return <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" width="30" height="30"><path d="M22 2 11 13M22 2l-7 20-4-9-9-4 20-7z" strokeLinejoin="round"/></svg>; }
function IcoBizPurp()      { return <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" width="30" height="30"><path d="M20 7H4a2 2 0 0 0-2 2v10a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2V9a2 2 0 0 0-2-2z"/><path d="M16 7V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v2"/></svg>; }
function IcoUltraPurp()    { return <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" width="30" height="30"><path d="M13 2L3 14h9l-1 8 10-12h-9l1-8z" strokeLinejoin="round"/></svg>; }

const ICON_MAP: Record<string, React.FC> = {
  gaming: IcoGaming,
  office: IcoOffice,
  student: IcoStudent,
  ultrabook: IcoUltra,
  macbook: IcoApple,
  designer: IcoDesign,
  dev: IcoDev,
  video: IcoVideo,
  rtx: IcoRTX,
  oled: IcoOLED,
  business: IcoBusiness,
  accessories: IcoAccessory,
};

const EXTRA_CATS = [
  { slug: "gaming",       name: "Игровые ноутбуки",   count: "128 моделей", desc: "RTX 5060/5070/5080, высокочастотные дисплеи 144–240 Гц" },
  { slug: "office",       name: "Ноутбуки для работы", count: "96 моделей",  desc: "Надёжные офисные решения для бизнеса" },
  { slug: "student",      name: "Для учёбы",           count: "64 модели",   desc: "Доступные и надёжные для студентов" },
  { slug: "ultrabook",    name: "Ультрабуки",          count: "52 модели",   desc: "Тонкие и лёгкие, до 1.5 кг" },
  { slug: "macbook",      name: "MacBook",             count: "22 модели",   desc: "Apple MacBook Air и Pro" },
  { slug: "designer",     name: "Для дизайнеров",      count: "31 модель",   desc: "OLED, цветоточные экраны" },
  { slug: "dev",          name: "Для разработчиков",   count: "44 модели",   desc: "RAM 32+ ГБ, Linux ready" },
  { slug: "video",        name: "Для видеомонтажа",    count: "28 моделей",  desc: "RTX, большой SSD, цветоточный дисплей" },
  { slug: "rtx",          name: "Ноутбуки с RTX",      count: "87 моделей",  desc: "NVIDIA GeForce RTX 40/50 серии" },
  { slug: "oled",         name: "OLED дисплеи",        count: "34 модели",   desc: "OLED-матрица для идеальной картинки" },
  { slug: "business",     name: "Для бизнеса",         count: "45 моделей",  desc: "Корпоративные решения" },
  { slug: "accessories",  name: "Аксессуары",          count: "210 товаров", desc: "Мыши, сумки, коврики, хабы" },
];

const PURPOSE_ITEMS = [
  { Icon: IcoStudyPurp,  label: "Для учёбы",     slug: "student" },
  { Icon: IcoOfficePurp, label: "Для офиса",      slug: "office" },
  { Icon: IcoDevPurp,    label: "Программисты",   slug: "dev" },
  { Icon: IcoGamingPurp, label: "Для игр",        slug: "gaming" },
  { Icon: IcoVideoPurp,  label: "Видеомонтаж",    slug: "video" },
  { Icon: Ico3DPurp,     label: "3D / AutoCAD",   slug: "designer" },
  { Icon: IcoDesignPurp, label: "Для дизайна",    slug: "designer" },
  { Icon: IcoTravelPurp, label: "Путешествия",    slug: "ultrabook" },
  { Icon: IcoBizPurp,    label: "Для бизнеса",    slug: "business" },
  { Icon: IcoUltraPurp,  label: "Ультрабуки",     slug: "ultrabook" },
];

export default function CategoriesPage() {
  const baseSlugs = new Set(CATEGORIES.map(c => c.slug));
  const allCats = [
    ...CATEGORIES,
    ...EXTRA_CATS.filter(c => !baseSlugs.has(c.slug)),
  ];
  const unique = allCats.filter((cat, idx, self) => self.findIndex(c => c.slug === cat.slug) === idx);

  return (
    <>
      <Header />
      <div className="page-hero">
        <div className="wrap">
          <div className="breadcrumbs">
            <Link href="/" prefetch={false}>Главная</Link>
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" width="14" height="14"><path d="M9 18l6-6-6-6"/></svg>
            <span>Категории</span>
          </div>
          <h1>Категории ноутбуков</h1>
          <p>Выберите тип ноутбука для ваших задач</p>
        </div>
      </div>

      <section className="info-section">
        <div className="wrap">
          <div style={{ display: "grid", gridTemplateColumns: "repeat(4,1fr)", gap: 20 }} className="categories-grid">
            {unique.map(cat => {
              const CatIcon = ICON_MAP[cat.slug] || IcoLaptop;
              return (
                <Link
                  key={cat.slug}
                  href={`/catalog?cat=${cat.slug}`}
                  prefetch={false}
                  style={{
                    background: "#fff",
                    border: "1.5px solid var(--border)",
                    borderRadius: 20,
                    padding: "28px 24px",
                    display: "flex",
                    flexDirection: "column",
                    gap: 12,
                    transition: "transform .3s, box-shadow .3s, border-color .3s",
                  }}
                  onMouseEnter={e => {
                    const el = e.currentTarget as HTMLElement;
                    el.style.transform = "translateY(-6px)";
                    el.style.boxShadow = "var(--shadow-card)";
                    el.style.borderColor = "transparent";
                  }}
                  onMouseLeave={e => {
                    const el = e.currentTarget as HTMLElement;
                    el.style.transform = "";
                    el.style.boxShadow = "";
                    el.style.borderColor = "var(--border)";
                  }}
                >
                  <span style={{
                    display: "inline-flex", alignItems: "center", justifyContent: "center",
                    width: 52, height: 52, borderRadius: 14,
                    background: "linear-gradient(135deg,#edfaf3,#d1fae5)",
                    color: "var(--success)",
                  }}>
                    <CatIcon />
                  </span>
                  <div>
                    <div style={{ fontWeight: 700, fontSize: 17, marginBottom: 4 }}>{cat.name}</div>
                    <div style={{ fontSize: 13, color: "var(--text-soft)", marginBottom: 8 }}>{"count" in cat ? (cat as { count: string }).count : ""}</div>
                    <div style={{ fontSize: 13.5, color: "var(--text-muted)", lineHeight: 1.5 }}>{"desc" in cat ? (cat as { desc: string }).desc : ""}</div>
                  </div>
                  <div style={{ marginTop: "auto", color: "var(--accent)", fontSize: 13.5, fontWeight: 700, display: "flex", alignItems: "center", gap: 4 }}>
                    Смотреть
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4" width="14" height="14"><path d="M5 12h14M13 6l6 6-6 6"/></svg>
                  </div>
                </Link>
              );
            })}
          </div>

          {/* By purpose */}
          <div style={{ marginTop: 72 }}>
            <div className="eyebrow">Подбор по задачам</div>
            <h2 className="section-title" style={{ marginBottom: 32 }}>Для кого ноутбук?</h2>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(5,1fr)", gap: 14 }} className="purpose-grid">
              {PURPOSE_ITEMS.map(({ Icon, label, slug }) => (
                <Link
                  key={label}
                  href={`/catalog?cat=${slug}`}
                  style={{
                    background: "var(--surface)",
                    borderRadius: 16,
                    padding: "20px 16px",
                    textAlign: "center",
                    fontWeight: 600,
                    fontSize: 13.5,
                    display: "flex",
                    flexDirection: "column",
                    alignItems: "center",
                    gap: 10,
                    transition: "background .2s, transform .2s",
                    border: "1.5px solid transparent",
                  }}
                  onMouseEnter={e => {
                    const el = e.currentTarget as HTMLElement;
                    el.style.background = "#fff";
                    el.style.transform = "translateY(-4px)";
                    el.style.borderColor = "var(--border)";
                  }}
                  onMouseLeave={e => {
                    const el = e.currentTarget as HTMLElement;
                    el.style.background = "var(--surface)";
                    el.style.transform = "";
                    el.style.borderColor = "transparent";
                  }}
                >
                  <span style={{
                    display: "inline-flex", alignItems: "center", justifyContent: "center",
                    width: 48, height: 48, borderRadius: 12,
                    background: "linear-gradient(135deg,#edfaf3,#d1fae5)",
                    color: "var(--success)",
                  }}>
                    <Icon />
                  </span>
                  <span>{label}</span>
                </Link>
              ))}
            </div>
          </div>
        </div>
      </section>

      <Footer />
    </>
  );
}
