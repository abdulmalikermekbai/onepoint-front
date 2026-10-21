import type { NextConfig } from "next";

const BACKEND_API_URL = process.env.BACKEND_API_URL || "https://api.onepoint.kz";

const nextConfig: NextConfig = {
  // 'standalone' creates a self-contained production bundle for Railway & Node server
  output: "standalone",

  // Clean URLs (/catalog?cat=gaming) without trailing slashes
  trailingSlash: false,

  // 301 Permanent Redirects for legacy URLs and migration from old site
  async redirects() {
    return [
      // 1. Old /p/slug -> /product/slug
      {
        source: "/p/:slug*",
        destination: "/product/:slug*",
        permanent: true,
      },
      // 2. Old /products/slug -> /product/slug
      {
        source: "/products/:slug*",
        destination: "/product/:slug*",
        permanent: true,
      },
      // 3. Old /item/slug -> /product/slug
      {
        source: "/item/:slug*",
        destination: "/product/:slug*",
        permanent: true,
      },
      // 4. Old /c/slug -> /catalog?cat=slug
      {
        source: "/c/:slug",
        destination: "/catalog?cat=:slug",
        permanent: true,
      },
      // 5. Old /index.php, /index.html -> /
      {
        source: "/index.php",
        destination: "/",
        permanent: true,
      },
      {
        source: "/index.html",
        destination: "/",
        permanent: true,
      },
    ];
  },

  // Rewrites: PHP API requests go to https://api.onepoint.kz/api/
  async rewrites() {
    return [
      {
        source: "/backend-api/:path*",
        destination: `${BACKEND_API_URL}/api/:path*`,
      },
    ];
  },

  // Optimize egress bandwidth and server compute
  poweredByHeader: false,
  compress: true,

  // Allow images from external domains with Next.js Image Optimization
  images: {
    minimumCacheTTL: 2592000, // 30 days cache for image optimization to save Railway CPU and bandwidth
    formats: ["image/avif", "image/webp"],
    remotePatterns: [
      {
        protocol: "https",
        hostname: "api.onepoint.kz",
        pathname: "/**",
      },
      {
        protocol: "https",
        hostname: "onepoint.kz",
        pathname: "/**",
      },
    ],
  },

  // Cache headers to reduce Railway egress and compute
  async headers() {
    return [
      {
        source: "/(icon.svg|favicon.ico)",
        headers: [
          {
            key: "Cache-Control",
            value: "public, max-age=86400, stale-while-revalidate=604800",
          },
        ],
      },
      {
        source: "/:path*",
        headers: [
          {
            key: "X-Content-Type-Options",
            value: "nosniff",
          },
          {
            key: "X-Frame-Options",
            value: "SAMEORIGIN",
          },
          {
            key: "Referrer-Policy",
            value: "strict-origin-when-cross-origin",
          },
        ],
      },
    ];
  },
};

export default nextConfig;
