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

    // Basic phone check: just ensure something is provided (no strict format validation)
    // Different users enter phones in different formats (+7, 8, etc.)
    if (phone && phone.trim().replace(/\D/g, "").length < 7) {
      return NextResponse.json({ ok: false, error: "Слишком короткий номер телефона" }, { status: 400 });
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

    // 1. Forward lead to main PHP backend API (which creates DB record & sends message to group -5319438603 with inline buttons)
    const backendApiUrl = process.env.BACKEND_API_URL || "https://api.onepoint.kz";
    try {
      const phpRes = await fetch(`${backendApiUrl}/api/lead.php`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });
      if (phpRes.ok) {
        return NextResponse.json({ ok: true });
      }
    } catch (_) {
      // Fallback if PHP backend is temporarily unreachable
    }

    // 2. Fallback: direct Telegram message to group -5319438603
    const botToken = process.env.TELEGRAM_BOT_TOKEN || "8510182301:AAEVviHThdSvbhwjDg0YDJT4f3K2YF6w5jU";
    const groupId = process.env.TELEGRAM_GROUP_ID || "-5319438603";

    if (botToken && groupId) {
      const now = new Date();
      const timeStr = now.toLocaleTimeString("ru-RU", { timeZone: "Asia/Almaty", hour: "2-digit", minute: "2-digit" });

      let text = `<b>🆕 Новая заявка</b>\n\n`;
      text += `<b>🆔 #${Math.floor(1000 + Math.random() * 9000)}</b>\n\n`;
      text += `👤 <b>Имя:</b> ${name || "Не указано"}\n`;
      text += `📞 <b>Телефон:</b> ${phone || "Не указан"}\n`;
      text += `💻 <b>Товар:</b> ${productName || message || "Консультация"}\n`;
      if (price) {
        text += `💰 <b>Цена:</b> ${typeof price === "number" ? price.toLocaleString("ru-RU") + " ₸" : price}\n`;
      }
      text += `\n🌐 <b>Источник:</b> OnePoint.kz\n`;
      text += `🕒 <b>Время:</b> ${timeStr}`;

      await fetch(`https://api.telegram.org/bot${botToken}/sendMessage`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          chat_id: groupId,
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

