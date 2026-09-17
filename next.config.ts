import type { NextConfig } from "next";

const BACKEND_API_URL = process.env.BACKEND_API_URL || "https://api.onepoint.kz";
const isExport = process.env.NEXT_OUTPUT_MODE === "export";

const nextConfig: NextConfig = {
  // 'standalone' creates a self-contained production bundle for Railway & Node server
  output: isExport ? "export" : "standalone",

  // Clean URLs (/catalog?cat=gaming) without trailing slashes
  trailingSlash: false,

  // Rewrites: PHP API requests go to https://api.onepoint.kz/api/
  ...(isExport ? {} : {
    async rewrites() {
      return [
        {
          source: "/backend-api/:path*",
          destination: `${BACKEND_API_URL}/api/:path*`,
        },
      ];
    },
  }),

  // Allow images from external domains
  images: {
    unoptimized: isExport,
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


