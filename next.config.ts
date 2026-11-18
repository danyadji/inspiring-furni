import type { NextConfig } from "next";
import createNextIntlPlugin from "next-intl/plugin";

const withNextIntl = createNextIntlPlugin("./src/i18n/request.ts");

// Extract remote WordPress hostname dynamically from WP_API_URL if provided
const wpUrl = process.env.WP_API_URL;
let wpHostname: string | undefined;

if (wpUrl) {
  try {
    const parsed = new URL(wpUrl);
    if (parsed.hostname && parsed.hostname !== "localhost" && parsed.hostname !== "127.0.0.1") {
      wpHostname = parsed.hostname;
    }
  } catch {}
}

const nextConfig: NextConfig = {
  devIndicators: false,
  images: {
    formats: ["image/avif", "image/webp"],
    remotePatterns: [
      {
        protocol: "http",
        hostname: "localhost",
      },
      {
        protocol: "https",
        hostname: "localhost",
      },
      {
        protocol: "https",
        hostname: "**.inspiringfurni.com",
      },
      {
        protocol: "https",
        hostname: "images.unsplash.com",
      },
      ...(wpHostname
        ? [
            {
              protocol: "https" as const,
              hostname: wpHostname,
            },
            {
              protocol: "http" as const,
              hostname: wpHostname,
            },
          ]
        : []),
    ],
  },
  async headers() {
    return [
      {
        source: "/:path*",
        headers: [
          { key: "X-Frame-Options", value: "SAMEORIGIN" },
          { key: "X-Content-Type-Options", value: "nosniff" },
          { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
        ],
      },
    ];
  },
};

export default withNextIntl(nextConfig);
