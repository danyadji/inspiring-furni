import { MetadataRoute } from "next";
import { getProducts } from "@/lib/products";
import { routing } from "@/i18n/routing";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const baseUrl = "https://inspiringfurni.com";
  const products = await getProducts();

  const pages = ["", "/produk", "/about", "/contact", "/keranjang"];

  const staticEntries: MetadataRoute.Sitemap = [];

  for (const page of pages) {
    for (const locale of routing.locales) {
      const isHome = page === "";
      staticEntries.push({
        url: `${baseUrl}/${locale}${page}`,
        lastModified: new Date(),
        changeFrequency: isHome ? "weekly" : "monthly",
        priority: isHome ? 1.0 : page === "/produk" ? 0.9 : 0.7,
        alternates: {
          languages: {
            id: `${baseUrl}/id${page}`,
            en: `${baseUrl}/en${page}`,
          },
        },
      });
    }
  }

  const productEntries: MetadataRoute.Sitemap = [];

  for (const product of products) {
    for (const locale of routing.locales) {
      productEntries.push({
        url: `${baseUrl}/${locale}/produk/${product.slug}`,
        lastModified: new Date(),
        changeFrequency: "weekly",
        priority: 0.8,
        alternates: {
          languages: {
            id: `${baseUrl}/id/produk/${product.slug}`,
            en: `${baseUrl}/en/produk/${product.slug}`,
          },
        },
      });
    }
  }

  return [...staticEntries, ...productEntries];
}
