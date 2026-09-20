import { NextResponse } from "next/server";
import { fetchLiveProducts, formatPrice } from "@/lib/data";

export const dynamic = "force-dynamic";
export const revalidate = 300;

function escapeXml(unsafe: string | number | undefined | null): string {
  if (unsafe === undefined || unsafe === null) return "";
  return String(unsafe)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&apos;");
}

function getProductTypeTree(categorySlug: string, categoryName: string): string {
  const cat = (categorySlug || "").toLowerCase();
  if (cat === "gaming") {
    return "Электроника > Компьютеры > Ноутбуки > Игровые ноутбуки";
  }
  if (cat === "ultrabook") {
    return "Электроника > Компьютеры > Ноутбуки > Ультрабуки";
  }
  if (cat === "macbook") {
    return "Электроника > Компьютеры > Ноутбуки > Apple MacBook";
  }
  if (cat === "office" || cat === "business") {
    return "Электроника > Компьютеры > Ноутбуки > Ноутбуки для работы и бизнеса";
  }
  if (cat === "student") {
    return "Электроника > Компьютеры > Ноутбуки > Ноутбуки для учёбы";
  }
  if (cat === "designer" || cat === "video") {
    return "Электроника > Компьютеры > Ноутбуки > Ноутбуки для дизайнеров и видеомонтажа";
  }
  if (cat === "oled") {
    return "Электроника > Компьютеры > Ноутбуки > Ноутбуки с OLED экраном";
  }
  if (cat === "rtx") {
    return "Электроника > Компьютеры > Ноутбуки > Ноутбуки с видеокартами NVIDIA GeForce RTX";
  }
  return `Электроника > Компьютеры > Ноутбуки > ${categoryName || "Ноутбуки"}`;
}

export async function GET() {
  const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://onepoint.kz";
  const products = await fetchLiveProducts();

  const seenSlugs = new Set<string>();
  const seenIds = new Set<number>();

  const validProducts = products.filter((p) => {
    if (!p.slug || !p.price || p.price <= 0) return false;
    if (seenSlugs.has(p.slug) || seenIds.has(p.id)) return false;
    seenSlugs.add(p.slug);
    seenIds.add(p.id);
    return true;
  });

  const itemsXml = validProducts
    .map((p) => {
      const productUrl = `${baseUrl}/product/${p.slug}`;
      const title = p.name || `${p.brand} ${p.model || ""}`.trim();

      // Build structured, informative description with verified specs
      const specList: string[] = [];
      if (p.processor) specList.push(`Процессор: ${p.processor}`);
      if (p.gpu) specList.push(`Видеокарта: ${p.gpu}`);
      if (p.ram) specList.push(`ОЗУ: ${p.ram}`);
      if (p.storage) specList.push(`Накопитель: ${p.storage}`);
      if (p.display) specList.push(`Экран: ${p.display} (${p.resolution || ""} ${p.refreshRate || ""})`);
      if (p.os) specList.push(`ОС: ${p.os}`);
      if (p.warranty) specList.push(`Гарантия: ${p.warranty}`);

      const specsText = specList.length > 0 ? ` Характеристики: ${specList.join("; ")}.` : "";
      const baseDesc = p.shortDescription || p.description || `Ноутбук ${title} с официальной гарантией в интернет-магазине OnePoint.kz. Доставка по Алматы и Казахстану.`;
      const desc = `${baseDesc}${specsText}`.trim();

      // Primary and additional images
      const allImages = p.images && p.images.length > 0 ? p.images : (p.image ? [p.image] : [`${baseUrl}/icon.svg`]);
      const primaryImage = allImages[0];
      const additionalImages = allImages.slice(1, 10);

      const additionalImagesXml = additionalImages
        .map((img) => `      <g:additional_image_link>${escapeXml(img)}</g:additional_image_link>`)
        .join("\n");

      const availability = p.inStock ? "in_stock" : "out_of_stock";
      const condition = p.condition === "Б/У" ? "used" : "new";
      const mpn = p.sku || p.model || `OP-${p.id}`;
      const productType = getProductTypeTree(p.categorySlug, p.categoryName);

      return `    <item>
      <g:id>${escapeXml(p.id)}</g:id>
      <g:title>${escapeXml(title)}</g:title>
      <g:description>${escapeXml(desc)}</g:description>
      <g:link>${escapeXml(productUrl)}</g:link>
      <g:image_link>${escapeXml(primaryImage)}</g:image_link>
${additionalImagesXml ? `${additionalImagesXml}\n` : ""}      <g:price>${p.price}.00 KZT</g:price>
      <g:availability>${availability}</g:availability>
      <g:condition>${condition}</g:condition>
      <g:brand>${escapeXml(p.brand || "OnePoint")}</g:brand>
      <g:mpn>${escapeXml(mpn)}</g:mpn>
      <g:identifier_exists>${p.sku || p.model ? "yes" : "no"}</g:identifier_exists>
      <g:google_product_category>Electronics &gt; Computers &gt; Laptops</g:google_product_category>
      <g:product_type>${escapeXml(productType)}</g:product_type>
    </item>`;
    })
    .join("\n");

  const xml = `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0" xmlns:g="http://base.google.com/ns/1.0">
  <channel>
    <title>OnePoint.kz - Каталог ноутбуков</title>
    <link>${escapeXml(baseUrl)}</link>
    <description>Оригинальные ноутбуки в Казахстане по выгодным ценам с гарантией 1 год. Каталог OnePoint.kz для Google Merchant Center.</description>
${itemsXml}
  </channel>
</rss>`;

  return new NextResponse(xml, {
    headers: {
      "Content-Type": "application/xml; charset=utf-8",
      "Cache-Control": "public, s-maxage=300, stale-while-revalidate=600",
    },
  });
}
