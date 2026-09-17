import { NextResponse } from "next/server";
import { fetchLiveProducts } from "@/lib/data";

export const dynamic = "force-dynamic";
export const revalidate = 3600;

function escapeXml(unsafe: string | number | undefined | null): string {
  if (unsafe === undefined || unsafe === null) return "";
  return String(unsafe)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&apos;");
}

export async function GET() {
  const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://onepoint.kz";
  const products = await fetchLiveProducts();

  const itemsXml = products
    .filter((p) => p.slug && p.price > 0)
    .map((p) => {
      const productUrl = `${baseUrl}/product/${p.slug}`;
      const title = p.name || `${p.brand} ${p.model || ""}`.trim();
      const desc =
        p.shortDescription ||
        p.description ||
        `Ноутбук ${title} с гарантией 1 год. Процессор ${p.processor || ""}, видеокарта ${p.gpu || ""}, ОЗУ ${p.ram || ""}, SSD ${p.storage || ""}.`;
      const img = p.image || (p.images && p.images[0]) || `${baseUrl}/icon.svg`;
      const availability = p.inStock ? "in_stock" : "out_of_stock";
      const condition = p.condition === "Б/У" ? "used" : "new";
      const mpn = p.sku || p.model || `OP-${p.id}`;

      return `    <item>
      <g:id>${escapeXml(p.id)}</g:id>
      <g:title>${escapeXml(title)}</g:title>
      <g:description>${escapeXml(desc)}</g:description>
      <g:link>${escapeXml(productUrl)}</g:link>
      <g:image_link>${escapeXml(img)}</g:image_link>
      <g:price>${p.price}.00 KZT</g:price>
      <g:availability>${availability}</g:availability>
      <g:brand>${escapeXml(p.brand || "OnePoint")}</g:brand>
      <g:condition>${condition}</g:condition>
      <g:mpn>${escapeXml(mpn)}</g:mpn>
      <g:google_product_category>Electronics &gt; Computers &gt; Laptops</g:google_product_category>
    </item>`;
    })
    .join("\n");

  const xml = `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0" xmlns:g="http://base.google.com/ns/1.0">
  <channel>
    <title>OnePoint.kz - Каталог ноутбуков</title>
    <link>${escapeXml(baseUrl)}</link>
    <description>Оригинальные ноутбуки в Казахстане по выгодным ценам с гарантией 1 год.</description>
${itemsXml}
  </channel>
</rss>`;

  return new NextResponse(xml, {
    headers: {
      "Content-Type": "application/xml; charset=utf-8",
      "Cache-Control": "public, s-maxage=3600, stale-while-revalidate=86400",
    },
  });
}
