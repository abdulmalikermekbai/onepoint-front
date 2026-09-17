import { NextRequest, NextResponse } from "next/server";

export const dynamic = "force-dynamic";

export async function GET(request: NextRequest) {
  const slug = request.nextUrl.searchParams.get("slug");
  if (slug) {
    return NextResponse.redirect(new URL(`/product/${slug}`, request.url), 301);
  }
  return NextResponse.redirect(new URL("/catalog", request.url), 301);
}
