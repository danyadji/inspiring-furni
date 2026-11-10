import { MetadataRoute } from "next";
import { PRIMARY_DOMAIN } from "@/lib/seo";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: "*",
      allow: "/",
      disallow: ["/api/", "/keranjang", "/*/keranjang"],
    },
    sitemap: `${PRIMARY_DOMAIN}/sitemap.xml`,
  };
}
