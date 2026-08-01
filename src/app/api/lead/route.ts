import { NextRequest, NextResponse } from "next/server";
import { db } from "@/db";
import { leads } from "@/db/schema";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const {
      type = "order",
      productId,
      productName,
      sku,
      price,
      name,
      phone,
      email,
      message,
      pageUrl,
    } = body;

    // Phone validation (KZ format +7 (7XX) XXX-XX-XX)
    // Only basic check: extract digits, must be exactly 11 digits and start with 7
    if (phone) {
      const pureDigits = phone.replace(/\D/g, "");
      if (pureDigits.length < 11 || !pureDigits.startsWith("7")) {
        return NextResponse.json({ ok: false, error: "Некорректный номер телефона" }, { status: 400 });
      }
    }

    // Save lead to local database if database connection is available
    try {
      await db.insert(leads).values({
        type,
        productId: productId || null,
        productName: productName || null,
        name: name || null,
        phone: phone || null,
        email: email || null,
        message: message || null,
      });
    } catch {
      // Ignore database save errors if database server is offline
    }

    // Format Telegram message
    const botToken = process.env.TELEGRAM_BOT_TOKEN || "8510182301:AAEVviHThdSvbhwjDg0YDJT4f3K2YF6w5jU";
    const chatId = process.env.TELEGRAM_CHAT_ID || "288706561";

    if (botToken && chatId) {
      const now = new Date();
      const dateStr = now.toLocaleString("ru-RU", { timeZone: "Asia/Almaty" });

      let text = `<b>📥 Новая заявка</b>\n\n`;
      text += `💻 <b>Ноутбук:</b>\n${productName || "Консультация / Запрос контактов"}\n\n`;

      if (sku) {
        text += `🆔 <b>Артикул:</b> ${sku}\n\n`;
      }
      if (price) {
        text += `💰 <b>Цена:</b> ${typeof price === "number" ? price.toLocaleString("ru-RU") + " ₸" : price}\n\n`;
      }

      text += `👤 <b>Имя:</b>\n${name || "Не указано"}\n\n`;
      text += `📞 <b>Телефон:</b>\n${phone || "Не указан"}\n\n`;

      if (message) {
        text += `💬 <b>Сообщение:</b>\n${message}\n\n`;
      }

      text += `🕒 <b>Дата:</b>\n${dateStr}\n\n`;

      if (pageUrl) {
        text += `🌐 <b>Страница:</b>\n${pageUrl}`;
      }

      await fetch(`https://api.telegram.org/bot${botToken}/sendMessage`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          chat_id: chatId,
          text: text.trim(),
          parse_mode: "HTML",
          disable_web_page_preview: true,
        }),
      }).catch((err) => console.error("Telegram notify error:", err));
    }

    return NextResponse.json({ ok: true });
  } catch (error) {
    console.error("Lead API error:", error);
    return NextResponse.json({ ok: true });
  }
}

