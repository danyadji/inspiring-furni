import sampleProducts from "@/data/sample-products.json";

export interface ProductImage {
  src: string;
  alt: string;
}

export interface ProductAttribute {
  name: string;
  options: string[];
}

export interface ProductVariation {
  id: number;
  attributes: Record<string, string>;
  price: string;
  regular_price: string;
}

export interface Category {
  id: number;
  name: string;
  slug: string;
}

export interface Product {
  id: number;
  name: string;
  slug: string;
  description: string;
  short_description: string;
  images: ProductImage[];
  /** Starting price (lowest variant), formatted as a plain number string */
  price: string;
  categories: Category[];
  attributes: ProductAttribute[];
  variations: ProductVariation[];
}

const useSampleData = process.env.USE_SAMPLE_DATA === "true";
const wpApiUrl = process.env.WP_API_URL ?? "";
const wcReadKey = process.env.WC_READ_KEY ?? "";
const wcReadSecret = process.env.WC_READ_SECRET ?? "";
const isDev = process.env.NODE_ENV === "development";

function basicAuth(key: string, secret: string): string {
  return "Basic " + Buffer.from(`${key}:${secret}`).toString("base64");
}

function stripHtml(html: string): string {
  if (!html) return "";
  return html.replace(/<[^>]*>?/gm, "").trim();
}

function cleanImageSrc(src?: string): string {
  if (!src) return "/images/placeholder-product.svg";
  // Replace https://localhost with http://localhost on local development
  return src.replace(/^https:\/\/localhost\//, "http://localhost/");
}

function getFetchOptions() {
  if (isDev) {
    return {
      headers: { Authorization: basicAuth(wcReadKey, wcReadSecret) },
      cache: "no-store" as const,
    };
  }
  return {
    headers: { Authorization: basicAuth(wcReadKey, wcReadSecret) },
    next: { revalidate: 15 },
  };
}

interface RawWcVariation {
  id: number;
  price?: string;
  regular_price?: string;
  attributes?: { name: string; option: string }[];
}

interface MetaItem {
  key: string;
  value: unknown;
}

interface RawWcProduct {
  id: number;
  name: string;
  slug: string;
  type?: string;
  description?: string;
  short_description?: string;
  images?: { src?: string; alt?: string }[];
  price?: string;
  categories?: { id: number; name: string; slug: string; name_en?: string; meta_data?: MetaItem[] }[];
  attributes?: { name: string; options?: string[]; name_en?: string }[];
  variations?: (number | ProductVariation)[];
  meta_data?: MetaItem[];
  name_en?: string;
  description_en?: string;
  short_description_en?: string;
}

function getMetaValue(meta: MetaItem[] | undefined, key: string): string | undefined {
  if (!meta || !Array.isArray(meta)) return undefined;
  const item = meta.find((m) => m.key === key);
  return item && typeof item.value === "string" && item.value.trim() ? item.value.trim() : undefined;
}

function normalizeProduct(
  raw: RawWcProduct,
  variations: ProductVariation[] = [],
  locale: string = "id"
): Product {
  const images: ProductImage[] =
    Array.isArray(raw.images) && raw.images.length > 0
      ? raw.images.map((img) => ({
          src: cleanImageSrc(img.src),
          alt: img.alt || raw.name,
        }))
      : [{ src: "/images/placeholder-product.svg", alt: raw.name }];

  const isEn = locale === "en";

  const resolvedName = isEn
    ? raw.name_en || getMetaValue(raw.meta_data, "name_en") || raw.name
    : raw.name;

  const rawDesc = isEn
    ? raw.description_en || getMetaValue(raw.meta_data, "description_en") || raw.description
    : raw.description;

  const rawShortDesc = isEn
    ? raw.short_description_en ||
      getMetaValue(raw.meta_data, "short_description_en") ||
      raw.short_description
    : raw.short_description;

  const categories: Category[] = (raw.categories || []).map((cat) => ({
    id: cat.id,
    name: isEn
      ? cat.name_en || getMetaValue(cat.meta_data, "name_en") || cat.name
      : cat.name,
    slug: cat.slug,
  }));

  const attributes: ProductAttribute[] = (raw.attributes || []).map((attr) => ({
    name: isEn && attr.name_en ? attr.name_en : attr.name,
    options: attr.options || [],
  }));

  return {
    id: raw.id,
    name: resolvedName,
    slug: raw.slug,
    description: stripHtml(rawDesc || ""),
    short_description: stripHtml(rawShortDesc || ""),
    images,
    price: raw.price || "0",
    categories,
    attributes,
    variations,
  };
}

export async function getProducts(locale: string = "id"): Promise<Product[]> {
  if (useSampleData) {
    return (sampleProducts as RawWcProduct[]).map((p) => normalizeProduct(p, [], locale));
  }

  try {
    const res = await fetch(
      `${wpApiUrl}/wp-json/wc/v3/products?per_page=100&status=publish`,
      getFetchOptions()
    );

    if (!res.ok) {
      console.warn(`WooCommerce API returned ${res.status}, falling back to sample products`);
      return (sampleProducts as RawWcProduct[]).map((p) => normalizeProduct(p, [], locale));
    }

    const rawProducts = (await res.json()) as RawWcProduct[];
    if (!Array.isArray(rawProducts) || rawProducts.length === 0) {
      return (sampleProducts as RawWcProduct[]).map((p) => normalizeProduct(p, [], locale));
    }
    return rawProducts.map((p) => normalizeProduct(p, [], locale));
  } catch (error) {
    console.error("Error fetching WooCommerce products, falling back:", error);
    return (sampleProducts as RawWcProduct[]).map((p) => normalizeProduct(p, [], locale));
  }
}

export async function getProductBySlug(slug: string, locale: string = "id"): Promise<Product | null> {
  if (useSampleData) {
    const found = (sampleProducts as RawWcProduct[]).find((p) => p.slug === slug);
    return found ? normalizeProduct(found, [], locale) : null;
  }

  try {
    const res = await fetch(
      `${wpApiUrl}/wp-json/wc/v3/products?slug=${encodeURIComponent(slug)}`,
      getFetchOptions()
    );

    if (!res.ok) {
      console.warn(`WooCommerce API error ${res.status} for slug ${slug}, checking sample fallback`);
      const fallback = (sampleProducts as RawWcProduct[]).find((p) => p.slug === slug);
      return fallback ? normalizeProduct(fallback, [], locale) : null;
    }

    const products = (await res.json()) as RawWcProduct[];
    const rawProduct = products[0];
    if (!rawProduct) {
      const fallback = (sampleProducts as RawWcProduct[]).find((p) => p.slug === slug);
      return fallback ? normalizeProduct(fallback, [], locale) : null;
    }

    // Fetch variations if it's a variable product
    let variations: ProductVariation[] = [];
    if (rawProduct.type === "variable") {
      try {
        const varRes = await fetch(
          `${wpApiUrl}/wp-json/wc/v3/products/${rawProduct.id}/variations?per_page=100`,
          getFetchOptions()
        );

        if (varRes.ok) {
          const rawVars = (await varRes.json()) as RawWcVariation[];
          variations = rawVars.map((v) => ({
            id: v.id,
            price: v.price || v.regular_price || rawProduct.price || "0",
            regular_price: v.regular_price || v.price || rawProduct.price || "0",
            attributes: (v.attributes || []).reduce<Record<string, string>>((acc, a) => {
              acc[a.name.toLowerCase()] = a.option;
              return acc;
            }, {}),
          }));
        }
      } catch (e) {
        console.error(`Failed to fetch variations for product ${rawProduct.id}:`, e);
      }
    }

    return normalizeProduct(rawProduct, variations, locale);
  } catch (error) {
    console.error(`Error fetching product by slug ${slug}:`, error);
    const fallback = (sampleProducts as RawWcProduct[]).find((p) => p.slug === slug);
    return fallback ? normalizeProduct(fallback, [], locale) : null;
  }
}

export async function getCategories(locale: string = "id"): Promise<Category[]> {
  if (useSampleData) {
    return getSampleCategories(locale);
  }

  try {
    const res = await fetch(
      `${wpApiUrl}/wp-json/wc/v3/products/categories?per_page=100`,
      getFetchOptions()
    );

    if (!res.ok) {
      console.warn(`WooCommerce API error ${res.status} for categories, falling back to sample categories`);
      return getSampleCategories(locale);
    }

    const rawCats = (await res.json()) as {
      id: number;
      name: string;
      slug: string;
      name_en?: string;
      meta_data?: MetaItem[];
    }[];

    if (!Array.isArray(rawCats) || rawCats.length === 0) {
      return getSampleCategories(locale);
    }

    const isEn = locale === "en";

    return rawCats.map((c) => ({
      id: c.id,
      name: isEn ? c.name_en || getMetaValue(c.meta_data, "name_en") || c.name : c.name,
      slug: c.slug,
    }));
  } catch (error) {
    console.error("Error fetching WooCommerce categories:", error);
    return getSampleCategories(locale);
  }
}

function getSampleCategories(locale: string = "id"): Category[] {
  const seen = new Set<number>();
  const cats: Category[] = [];
  const isEn = locale === "en";

  for (const p of sampleProducts as RawWcProduct[]) {
    for (const c of p.categories || []) {
      if (!seen.has(c.id)) {
        seen.add(c.id);
        cats.push({
          id: c.id,
          name: isEn ? c.name_en || getMetaValue(c.meta_data, "name_en") || c.name : c.name,
          slug: c.slug,
        });
      }
    }
  }
  return cats;
}
