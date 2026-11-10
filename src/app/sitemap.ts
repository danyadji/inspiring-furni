import { MetadataRoute } from "next";
import { getProducts, getCategories } from "@/lib/products";
import { routing } from "@/i18n/routing";
import { PRIMARY_DOMAIN } from "@/lib/seo";

export const revalidate = 3600;

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const baseUrl = PRIMARY_DOMAIN;

  const [products, categories] = await Promise.all([
    getProducts("id"),
    getCategories("id"),
  ]);

  // Static public pages (exclude cart /keranjang and /api/)
  const staticPages = [
    { path: "", priority: 1.0, changeFrequency: "weekly" as const },
    { path: "/produk", priority: 0.9, changeFrequency: "weekly" as const },
    { path: "/about", priority: 0.7, changeFrequency: "monthly" as const },
    { path: "/contact", priority: 0.7, changeFrequency: "monthly" as const },
  ];

  const staticEntries: MetadataRoute.Sitemap = [];

  for (const page of staticPages) {
    for (const locale of routing.locales) {
      const pagePath = page.path;
      staticEntries.push({
        url: `${baseUrl}/${locale}${pagePath}`,
        lastModified: new Date(),
        changeFrequency: page.changeFrequency,
        priority: page.priority,
        alternates: {
          languages: {
            id: `${baseUrl}/id${pagePath}`,
            en: `${baseUrl}/en${pagePath}`,
          },
        },
      });
    }
  }

  // Category entries
  const categoryEntries: MetadataRoute.Sitemap = [];

  for (const cat of categories) {
    if (!cat.slug || cat.slug === "tanpa-kategori") continue;

    for (const locale of routing.locales) {
      categoryEntries.push({
        url: `${baseUrl}/${locale}/kategori/${cat.slug}`,
        lastModified: new Date(),
        changeFrequency: "weekly",
        priority: 0.8,
        alternates: {
          languages: {
            id: `${baseUrl}/id/kategori/${cat.slug}`,
            en: `${baseUrl}/en/kategori/${cat.slug}`,
          },
        },
      });
    }
  }

  // Product entries
  const productEntries: MetadataRoute.Sitemap = [];

  for (const product of products) {
    if (!product.slug) continue;

    let lastModified = new Date();
    if (product.dateModified) {
      const parsed = new Date(product.dateModified);
      if (!isNaN(parsed.getTime())) {
        lastModified = parsed;
      }
    }

    for (const locale of routing.locales) {
      productEntries.push({
        url: `${baseUrl}/${locale}/produk/${product.slug}`,
        lastModified,
        changeFrequency: "weekly",
        priority: 0.9,
        alternates: {
          languages: {
            id: `${baseUrl}/id/produk/${product.slug}`,
            en: `${baseUrl}/en/produk/${product.slug}`,
          },
        },
      });
    }
  }

  // Deduplicate entries by URL
  const seen = new Set<string>();
  const finalEntries: MetadataRoute.Sitemap = [];

  for (const entry of [...staticEntries, ...categoryEntries, ...productEntries]) {
    if (!seen.has(entry.url)) {
      seen.add(entry.url);
      finalEntries.push(entry);
    }
  }

  return finalEntries;
}
