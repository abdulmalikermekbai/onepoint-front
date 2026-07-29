import type { Metadata } from "next";
import type { ReactNode } from "react";
import "./globals.css";

export const metadata: Metadata = {
  title: "OnePoint — Ноутбуки в Казахстане | Лучшие цены",
  description:
    "Интернет-магазин ноутбуков в Казахстане. ASUS, Lenovo, HP, Acer, Dell, MSI, Apple. Официальная гарантия, доставка по всему Казахстану, рассрочка 0%.",
  keywords:
    "ноутбуки Казахстан, купить ноутбук Алматы, игровые ноутбуки, MacBook, Lenovo, ASUS, HP",
  icons: {
    icon: "/icon.svg",
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
      </head>
      <body>{children}</body>
    </html>
  );
}
