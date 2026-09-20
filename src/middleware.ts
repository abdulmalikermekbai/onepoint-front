import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

export function middleware(request: NextRequest) {
  const url = request.nextUrl.clone();
  const hostname = request.headers.get("host") || "";
  const pathname = url.pathname;
  const search = url.search;

  // 1. Domain normalization: Redirect www.onepoint.kz to onepoint.kz
  if (hostname.startsWith("www.")) {
    const canonicalHost = hostname.replace(/^www\./, "");
    url.host = canonicalHost;
    url.port = "";
    return NextResponse.redirect(url, 301);
  }

  // 2. Misspelled and legacy static route redirects
  if (pathname === "/guaranty" || pathname === "/guaranty/") {
    url.pathname = "/guarantee";
    url.search = "";
    return NextResponse.redirect(url, 301);
  }

  if (pathname === "/catalog/aksessuary-k-noutbuku" || pathname === "/catalog/aksessuary-k-noutbuku/") {
    url.pathname = "/catalog";
    url.search = "";
    return NextResponse.redirect(url, 301);
  }

  if (pathname === "/compare-products" || pathname === "/compare-products/") {
    url.pathname = "/catalog";
    url.search = "";
    return NextResponse.redirect(url, 301);
  }

  // 3. Clean up legacy query parameters (?view=attributes, ?view=descriptions, ?view=reviews)
  if (url.searchParams.has("view")) {
    url.searchParams.delete("view");
    return NextResponse.redirect(url, 301);
  }

  // 4. Clean trailing slashes on all standard routes (except root)
  if (pathname.length > 1 && pathname.endsWith("/") && !pathname.startsWith("/api")) {
    url.pathname = pathname.slice(0, -1);
    return NextResponse.redirect(url, 301);
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    /*
     * Match all request paths except:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico, icon.svg, robots.txt, sitemap.xml, merchant-feed.xml
     * - api routes
     */
    "/((?!_next/static|_next/image|favicon.ico|icon.svg|robots.txt|sitemap.xml|merchant-feed.xml|feeds|api).*)",
  ],
};
