import type { NextConfig } from "next";

const BACKEND_API_URL = process.env.BACKEND_API_URL || "https://api.onepoint.kz";

const nextConfig: NextConfig = {
  // 'standalone' creates a self-contained production bundle for Railway & Node server
  output: "standalone",

  // Clean URLs (/catalog?cat=gaming) without trailing slashes
  trailingSlash: false,

  // Rewrites: PHP API requests go to https://api.onepoint.kz/api/
  async rewrites() {
    return [
      {
        source: "/backend-api/:path*",
        destination: `${BACKEND_API_URL}/api/:path*`,
      },
    ];
  },

  // Allow images from external domains with Next.js Image Optimization
  images: {
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
};

export default nextConfig;
