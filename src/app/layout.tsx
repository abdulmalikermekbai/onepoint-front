import type { Metadata } from "next";
import type { ReactNode } from "react";
import "./globals.css";

export const metadata: Metadata = {
  metadataBase: new URL(process.env.NEXT_PUBLIC_SITE_URL || "https://onepoint.kz"),
  title: "OnePoint — Ноутбуки в Казахстане | Лучшие цены",
  description:
    "Интернет-магазин ноутбуков в Казахстане. ASUS, Lenovo, HP, Acer, Dell, MSI, Apple. Гарантия 1 год, доставка по всему Казахстану по лучшим ценам.",
  keywords:
    "ноутбуки Казахстан, купить ноутбук Алматы, игровые ноутбуки, MacBook, Lenovo, ASUS, HP",
  icons: {
    icon: "/icon.svg",
  },
  openGraph: {
    type: "website",
    locale: "ru_RU",
    url: "/",
    title: "OnePoint — Ноутбуки в Казахстане | Лучшие цены",
    description: "Интернет-магазин ноутбуков в Казахстане. Гарантия 1 год, доставка по всему Казахстану по лучшим ценам.",
    siteName: "OnePoint",
  },
  twitter: {
    card: "summary_large_image",
    title: "OnePoint — Ноутбуки в Казахстане | Лучшие цены",
    description: "Интернет-магазин ноутбуков в Казахстане.",
  },
  alternates: {
    canonical: "/",
  },
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="ru">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link
          rel="preconnect"
          href="https://fonts.gstatic.com"
          crossOrigin="anonymous"
        />
        <link
          href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800;900&display=swap"
          rel="stylesheet"
        />
        {/* Google Analytics 4 */}
        <script
          async
          src={`https://www.googletagmanager.com/gtag/js?id=${process.env.NEXT_PUBLIC_GA_ID || 'G-XXXXXXXXXX'}`}
        />
        <script
          dangerouslySetInnerHTML={{
            __html: `
              window.dataLayer = window.dataLayer || [];
              function gtag(){dataLayer.push(arguments);}
              gtag('js', new Date());
              gtag('config', '${process.env.NEXT_PUBLIC_GA_ID || 'G-XXXXXXXXXX'}', {
                page_path: window.location.pathname,
              });
            `,
          }}
        />
        {/* Meta Pixel */}
        <script
          dangerouslySetInnerHTML={{
            __html: `
              !function(f,b,e,v,n,t,s)
              {if(f.fbq)return;n=f.fbq=function(){n.callMethod?
              n.callMethod.apply(n,arguments):n.queue.push(arguments)};
              if(!f._fbq)f._fbq=n;n.push=n;n.loaded=!0;n.version='2.0';
              n.queue=[];t=b.createElement(e);t.async=!0;
              t.src=v;s=b.getElementsByTagName(e)[0];
              s.parentNode.insertBefore(t,s)}(window, document,'script',
              'https://connect.facebook.net/en_US/fbevents.js');
              fbq('init', '${process.env.NEXT_PUBLIC_FB_PIXEL_ID || 'XXXXXXXXXXXXXXX'}');
              fbq('track', 'PageView');
            `,
          }}
        />
      </head>
      <body>{children}</body>
    </html>
  );
}
