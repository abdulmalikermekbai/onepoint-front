import { NextRequest, NextResponse } from "next/server";
import { fetchLiveProducts } from "@/lib/data";
import { resolveCanonicalProductSlug } from "@/lib/legacy-redirects";


export async function GET(request: NextRequest) {
  const slug = request.nextUrl.searchParams.get("slug");
  if (slug) {
    const allProducts = await fetchLiveProducts();
    const resolution = resolveCanonicalProductSlug(slug, allProducts);
    const targetSlug = resolution.canonicalSlug || slug;
    return NextResponse.redirect(new URL(`/product/${targetSlug}`, request.url), 301);
  }
  return NextResponse.redirect(new URL("/catalog", request.url), 301);
}

