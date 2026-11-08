import { Product } from "@/lib/products";

export function getSiteUrl(): string {
  const envUrl = process.env.NEXT_PUBLIC_SITE_URL;
  if (envUrl && typeof envUrl === "string" && envUrl.trim()) {
    return envUrl.trim().replace(/\/+$/, "");
  }
  if (process.env.VERCEL_URL) {
    return `https://${process.env.VERCEL_URL}`;
  }
  return "http://localhost:3000";
}

export function stripHtmlAndTruncate(htmlOrText?: string, maxLength = 155): string {
  if (!htmlOrText || typeof htmlOrText !== "string") return "";

  const stripped = htmlOrText
    .replace(/<[^>]*>/g, " ")
    .replace(/&amp;/g, "&")
    .replace(/&quot;/g, '"')
    .replace(/&#039;/g, "'")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&nbsp;/g, " ")
    .replace(/\s+/g, " ")
    .trim();

  if (stripped.length <= maxLength) {
    return stripped;
  }

  // Truncate at nearest word boundary before maxLength
  const truncated = stripped.slice(0, maxLength);
  const lastSpace = truncated.lastIndexOf(" ");
  if (lastSpace > maxLength * 0.7) {
    return `${truncated.slice(0, lastSpace)}...`;
  }
  return `${truncated}...`;
}

export function buildCanonicalAndAlternates(pathWithoutLocale: string, locale: string) {
  const siteUrl = getSiteUrl();
  const cleanPath = pathWithoutLocale.startsWith("/")
    ? pathWithoutLocale
    : `/${pathWithoutLocale}`;
  const normalizedPath = cleanPath === "/" ? "" : cleanPath;

  return {
    canonical: `${siteUrl}/${locale}${normalizedPath}`,
    languages: {
      id: `${siteUrl}/id${normalizedPath}`,
      en: `${siteUrl}/en${normalizedPath}`,
      "x-default": `${siteUrl}/id${normalizedPath}`,
    },
  };
}

export function sanitizePublicImage(src: string, siteUrl: string): string {
  if (!src) return `${siteUrl}/images/placeholder-product.svg`;
  // Never expose internal WordPress/CMS localhost addresses to search engines
  if (
    src.includes("localhost") ||
    src.includes("127.0.0.1") ||
    src.includes("cms.") ||
    src.includes("/wordpress/")
  ) {
    return `${siteUrl}/images/placeholder-product.svg`;
  }
  if (src.startsWith("http://") || src.startsWith("https://")) {
    return src;
  }
  const cleanSrc = src.startsWith("/") ? src : `/${src}`;
  return `${siteUrl}${cleanSrc}`;
}

export function buildProductJsonLd(product: Product, locale: string) {
  const siteUrl = getSiteUrl();
  const productUrl = `${siteUrl}/${locale}/produk/${product.slug}`;

  const imageList = product.images.map((img) => sanitizePublicImage(img.src, siteUrl));
  if (imageList.length === 0) {
    imageList.push(`${siteUrl}/images/placeholder-product.svg`);
  }

  const inStock = product.stockStatus !== "outofstock";
  const availability = inStock
    ? "https://schema.org/InStock"
    : "https://schema.org/OutOfStock";

  let offers: Record<string, unknown>;

  if (product.variations && product.variations.length > 1) {
    const prices = product.variations
      .map((v) => parseFloat(v.price))
      .filter((p) => !isNaN(p) && p > 0);

    const lowPrice = prices.length > 0 ? Math.min(...prices) : parseFloat(product.price) || 0;
    const highPrice = prices.length > 0 ? Math.max(...prices) : lowPrice;

    offers = {
      "@type": "AggregateOffer",
      priceCurrency: "IDR",
      lowPrice: lowPrice,
      highPrice: highPrice,
      offerCount: product.variations.length,
      priceValidUntil: "2027-12-31",
      availability,
      url: productUrl,
      seller: {
        "@type": "Organization",
        name: "Inspiring Furni",
      },
    };
  } else {
    offers = {
      "@type": "Offer",
      priceCurrency: "IDR",
      price: parseFloat(product.price) || 0,
      priceValidUntil: "2027-12-31",
      availability,
      url: productUrl,
      seller: {
        "@type": "Organization",
        name: "Inspiring Furni",
      },
    };
  }

  return {
    "@context": "https://schema.org",
    "@type": "Product",
    name: product.name,
    image: imageList,
    description: stripHtmlAndTruncate(product.short_description || product.description, 300),
    sku: product.sku || `IF-${product.id}`,
    url: productUrl,
    brand: {
      "@type": "Brand",
      name: "Inspiring Furni",
    },
    offers,
  };
}

export function buildBreadcrumbJsonLd(
  crumbs: { name: string; pathWithoutLocale: string }[],
  locale: string
) {
  const siteUrl = getSiteUrl();

  return {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: crumbs.map((crumb, idx) => {
      const cleanPath = crumb.pathWithoutLocale.startsWith("/")
        ? crumb.pathWithoutLocale
        : `/${crumb.pathWithoutLocale}`;
      const url = cleanPath === "/"
        ? `${siteUrl}/${locale}`
        : `${siteUrl}/${locale}${cleanPath}`;

      return {
        "@type": "ListItem",
        position: idx + 1,
        name: crumb.name,
        item: url,
      };
    }),
  };
}

export function buildOrganizationJsonLd() {
  const siteUrl = getSiteUrl();

  return {
    "@context": "https://schema.org",
    "@type": "Organization",
    name: "Inspiring Furni",
    url: siteUrl,
    logo: `${siteUrl}/images/placeholder-product.svg`,
    description:
      "Workshop pengrajin furnitur kayu jati asli Jepara tanpa perantara. Spesialis meja makan, kursi, dipan, credenza, serta jendela dan pintu custom.",
    contactPoint: {
      "@type": "ContactPoint",
      telephone: "+6289518906727",
      contactType: "customer service",
      areaServed: "ID",
      availableLanguage: ["Indonesian", "English"],
    },
    address: {
      "@type": "PostalAddress",
      streetAddress: "Kecamatan Tahunan",
      addressLocality: "Jepara",
      addressRegion: "Jawa Tengah",
      postalCode: "59427",
      addressCountry: "ID",
    },
    sameAs: [
      "https://www.instagram.com/inspiringfurni",
      "https://www.tiktok.com/@inspiringfurni",
    ],
  };
}

export function buildWebSiteJsonLd(locale: string) {
  const siteUrl = getSiteUrl();

  return {
    "@context": "https://schema.org",
    "@type": "WebSite",
    name: "Inspiring Furni",
    url: `${siteUrl}/${locale}`,
    inLanguage: locale === "en" ? "en-US" : "id-ID",
    potentialAction: {
      "@type": "SearchAction",
      target: `${siteUrl}/${locale}/produk?category={search_term_string}`,
      "query-input": "required name=search_term_string",
    },
  };
}
