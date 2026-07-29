import type { NextConfig } from "next";

const BACKEND_API_URL = process.env.BACKEND_API_URL || "https://api.onepoint.kz";

const nextConfig: NextConfig = {
  // Rewrites: PHP API requests go to https://api.onepoint.kz/api/
  // Next.js internal API routes (/api/lead, /api/newsletter) are handled locally
  async rewrites() {
    return [
      {
        source: "/backend-api/:path*",
        destination: `${BACKEND_API_URL}/api/:path*`,
      },
    ];
  },

  // Allow images from external domains
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "api.onepoint.kz",
        pathname: "/**",
      },
    ],
  },
};

export default nextConfig;
