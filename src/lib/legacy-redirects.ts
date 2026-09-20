/**
 * Legacy URL and Slug Redirect Registry for OnePoint.kz
 * Maps historical Google-indexed URLs and slugs from old versions of the site
 * to active product canonical URLs.
 */

import { Product } from "./data";

export const KNOWN_SLUG_REDIRECTS: Record<string, string> = {
  // 1. Critical traffic URLs from Google Search Console
  "asus-tuf-a16-ryzen7-h260-rtx5060": "asus-tuf-gaming-a16-fa607nuq-rl030",
  "asus-tuf-gaming-a16-fa608uh-90nr0ks2-m003t0": "asus-tuf-gaming-a18-fa808uh-rs74",
  "ideapad-5-2-in-1-16ahp9": "lenovo-ideapad-5-2-in-1-16-ryzen-7-8845hs-16-gb-1-tb-16-touch",
  "lenovo-loq-15irx10-83je000xus": "noutbuk-lenovo-loq-15arp9-15-6-fhd-144hz-ryzen-5-7235hs-16gb-512gb-ssd-rtx-4050-win-11",
  "hp-victus-15-fb3025ax": "hp-omnibook-5-16-fb0037nr-snapdragon-32gb-512gb",

  // 2. High-volume legacy /p/ and /product/ slugs
  "lenovo-loq-15-amd-ryzen-7-7735hs-16gb-512gb-rtx-4050-156-fhd-ips-144hz": "noutbuk-lenovo-loq-15arp9-15-6-fhd-144hz-ryzen-5-7235hs-16gb-512gb-ssd-rtx-4050-win-11",
  "lenovo-loq-15arp10e-amd-ryzen-5-7535hs-16gb-512gb-rtx-3050-6gb-156-fhd-ips-144hz": "noutbuk-lenovo-loq-15arp9-15-6-fhd-144hz-ryzen-5-7235hs-16gb-512gb-ssd-rtx-4050-win-11",
  "lenovo-loq-15-intel-core-i7-13645hx-16gb-512gb-rtx-5050-156-fhd-ips-144hz": "noutbuk-lenovo-loq-15arp9-15-6-fhd-144hz-ryzen-5-7235hs-16gb-512gb-ssd-rtx-4050-win-11",
  "lenovo-loq-15-intel-core-i7-13650hx-16gb-1tb-rtx-5050-156-fhd-ips-144hz": "noutbuk-lenovo-loq-15arp9-15-6-fhd-144hz-ryzen-5-7235hs-16gb-512gb-ssd-rtx-4050-win-11",
  "lenovo-loq-15-amd-ryzen-5-220-16gb-512gb-rtx-5050-156-fhd-ips-144hz": "noutbuk-lenovo-loq-15arp9-15-6-fhd-144hz-ryzen-5-7235hs-16gb-512gb-ssd-rtx-4050-win-11",
  "lenovo-legion-5-intel-core-ultra-7-255hx-16gb-512gb-rtx-5060-151-wqxga-oled-165hz": "lenovo-legion-5-15iax10-83f00005us",
  "lenovo-legion-5-intel-core-ultra-9-275hx-32gb-1tb-rtx-5070-151-wqxga-oled": "lenovo-legion-5-15iax10-83f00005us",
  "asus-tuf-gaming-f16-intel-core-i5-13450hx-16gb-512gb-rtx-5050-16-fhd-ips": "asus-tuf-f16-i5-13450hx",
  "asus-tuf-gaming-f16-intel-core-5-210h-16gb-512gb-rtx-3050-16-fhd-ips": "asus-tuf-gaming-f16-fx607vu-as51-ca",
  "asus-rog-strix-g16-amd-ryzen-9-8940hx-16gb-1tb-rtx-5070-ti-16-25k-ips-165hz": "asus-rog-strix-g16-ryzen9-8940hx-rtx5070",
  "msi-vector-a16-hx-ai-intel-core-ultra-9-275hx-16gb-1tb-rtx-5080-160-qhd-25ips-240hz": "msi-vector-a16-hx-ai-ultra9-16gb-1tb",
  "msi-vector-a16-hx-ai-intel-core-ultra-9-275hx-32gb-2tb-rtx-5080-160-qhd-25ips-240hz": "msi-vector-a16-hx-ai-ultra9-32gb-1tb",
  "msi-vector-a16-hx-ai-intel-core-ultra-9-275hx-64gb-1tb-rtx-5080-160-qhd-25ips-240hz": "msi-vector-a16-hx-ai-ultra9-32gb-1tb",
  "lenovo-ideapad-slim-3-amd-ryzen-7-5825u-16gb-512gb-lenovo-ideapad-slim-3": "lenovo-ideapad-5-2-in-1-16-ryzen-7-8845hs-16-gb-1-tb-16-touch",
  "lenovo-ideapad-slim-5-amd-ryzen-ai-5-340-16gb-512gb-amd-radeon-840m-16-wuxga-ips-touch": "lenovo-ideapad-5-2-in-1-16-ryzen-7-8845hs-16-gb-1-tb-16-touch",
  "hp-victus-15-intel-core-i5-13420h-16gb-512gb-rtx-4050-156-fhd-ips-19201080-144-hz": "hp-omnibook-5-16-fb0037nr-snapdragon-32gb-512gb",
  "hp-victus-15-amd-ryzen-7-7445hs-16-gb-512-gb-rtx-4050-156-fhd-ips-19201080-144-hz": "hp-omnibook-5-16-fb0037nr-snapdragon-32gb-512gb",
  "hp-laptop-15-amd-ryzen-5-7520u-8gb-512gb-amd-radeon-156-ips-full-hd-sensornyy": "hp-omnibook-x-flip-14-kc0013dx-ryzen-ai-5-430-16-gb-512-gb-14-oled-touch",
  "asus-tuf-gaming-a16-amd-ryzen-7-h-260-16gb-512gb-rtx-5050-16-ips-full-hd": "asus-tuf-gaming-a16-fa607nuq-rl030",
  "msi-raider-a18-hx-amd-ryzen-9-9955hx3d-32gb-2tb-rtx-5080-18-4k-uhd-mini-led-120hz": "msi-raider-a18-ultra9-285hx-32gb-rtx5080",
  "msi-stealth-a16-ai-amd-ryzen-ai-9-hx-370-32gb-2tb-rtx-5080-160-qhd-25k-oled-240hz": "msi-stealth-18-hx-ai-ultra9-64gb-rtx5080",
  "xiaomi-redmibook-14-enhanced-edition-i7-10510u8gb512gbmx250": "acer-swift-go-16-sfg16-72-5844",
  "xiaomi-mi-notebook-air-133-core-i5-8250u256gb8gbmx150": "acer-swift-neo-sfn14-54h-ultra5-115u",
  "lenovo-slim-7i-aura-edition-15-wuxga-60hz-core-ultra-7-258v-16gb-512gb-ssd-intel-arc-140v-win-11-home": "lenovo-slim-7i-aura-edition-14-wuxga-60hz-core-ultra-7-256v-16gb-512gb-ssd-intel-arc-140v-win-11-home"
};

/**
 * Resolves a given slug against:
 * 1. Explicit KNOWN_SLUG_REDIRECTS mapping
 * 2. Active products list (exact slug match, case-insensitive match, ID / model / SKU match)
 * 3. Fuzzy keyword token matching
 */
export function resolveCanonicalProductSlug(
  rawSlug: string,
  liveProducts: Product[] = []
): { canonicalSlug: string | null; isRedirect: boolean } {
  if (!rawSlug) return { canonicalSlug: null, isRedirect: false };
  const cleanSlug = decodeURIComponent(rawSlug).trim().toLowerCase();

  // 1. Check direct match in live products
  const direct = liveProducts.find(
    (p) => p.slug === rawSlug || p.slug?.toLowerCase() === cleanSlug
  );
  if (direct) {
    return {
      canonicalSlug: direct.slug,
      isRedirect: direct.slug !== rawSlug,
    };
  }

  // 2. Check explicit known redirects map
  if (KNOWN_SLUG_REDIRECTS[cleanSlug]) {
    const target = KNOWN_SLUG_REDIRECTS[cleanSlug];
    const targetProduct = liveProducts.find(
      (p) => p.slug === target || p.slug?.toLowerCase() === target.toLowerCase()
    );
    return {
      canonicalSlug: targetProduct ? targetProduct.slug : target,
      isRedirect: true,
    };
  }

  // 3. Match by ID or SKU or Model
  const byIdOrSku = liveProducts.find(
    (p) =>
      String(p.id) === cleanSlug ||
      `product-${p.id}` === cleanSlug ||
      (p.sku && p.sku.toLowerCase() === cleanSlug) ||
      (p.model && p.model.toLowerCase().replace(/[^a-z0-9]+/g, "-") === cleanSlug)
  );
  if (byIdOrSku) {
    return {
      canonicalSlug: byIdOrSku.slug,
      isRedirect: true,
    };
  }

  // 4. Fuzzy keyword match against active catalog
  const slugTokens = cleanSlug.split(/[-_]+/).filter((t) => t.length > 2);
  if (slugTokens.length >= 2 && liveProducts.length > 0) {
    let bestScore = 0;
    let candidate: Product | null = null;

    for (const p of liveProducts) {
      const pTokens = `${p.slug} ${p.name} ${p.model || ""} ${p.sku || ""}`
        .toLowerCase()
        .split(/[^a-z0-9]+/)
        .filter((t) => t.length > 2);

      let overlap = 0;
      for (const token of slugTokens) {
        if (pTokens.includes(token)) overlap++;
      }
      const score = overlap / Math.max(slugTokens.length, 1);
      if (score >= 0.45 && score > bestScore) {
        bestScore = score;
        candidate = p;
      }
    }

    if (candidate) {
      return {
        canonicalSlug: candidate.slug,
        isRedirect: true,
      };
    }
  }

  return { canonicalSlug: null, isRedirect: false };
}
