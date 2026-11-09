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
  sale_price?: string;
  on_sale?: boolean;
}

export interface Category {
  id: number;
  name: string;
  slug: string;
  description?: string;
  image?: string;
  count?: number;
  seoTitle?: string;
  seoDescription?: string;
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
  regular_price?: string;
  sale_price?: string;
  on_sale?: boolean;
  categories: Category[];
  attributes: ProductAttribute[];
  variations: ProductVariation[];
  sku?: string;
  stockStatus?: "instock" | "outofstock" | "onbackorder";
  dateModified?: string;
  seoTitle?: string;
  seoDescription?: string;
}

const wpApiUrl = process.env.WP_API_URL ?? "";
const wcReadKey = process.env.WC_READ_KEY ?? "";
const wcReadSecret = process.env.WC_READ_SECRET ?? "";

// Mode Standalone / Demo: Aktif jika USE_SAMPLE_DATA="true", atau WP_API_URL kosong,
// atau saat di-deploy ke Vercel (production) sementara WP_API_URL masih mengarah ke localhost
const isVercelLocalhost =
  process.env.NODE_ENV === "production" &&
  (wpApiUrl.includes("localhost") || wpApiUrl.includes("127.0.0.1"));

const useSampleData =
  process.env.USE_SAMPLE_DATA === "true" || !wpApiUrl || isVercelLocalhost;

const SAMPLE_PRODUCT_IMAGES: Record<string, string> = {
  "meja-makan-jati-minimalis":
    "https://images.unsplash.com/photo-1617806118233-18e1de247200?auto=format&fit=crop&w=800&q=80",
  "kursi-makan-jati-ropan":
    "https://images.unsplash.com/photo-1503602642458-232111445657?auto=format&fit=crop&w=800&q=80",
  "dipan-tempat-tidur-jati-spindle":
    "https://images.unsplash.com/photo-1505693416388-ac5ce068fe85?auto=format&fit=crop&w=800&q=80",
  "nakas-samping-kasur-jati":
    "https://images.unsplash.com/photo-1532372320572-cda25653a26d?auto=format&fit=crop&w=800&q=80",
  "sofa-kursi-santai-jati-retro":
    "https://images.unsplash.com/photo-1555041469-a586c61ea9bc?auto=format&fit=crop&w=800&q=80",
  "meja-kopi-coffee-table-bundar-jati":
    "https://images.unsplash.com/photo-1533090161767-e6ffed986c88?auto=format&fit=crop&w=800&q=80",
  "credenza-bufet-tv-jati-kisi":
    "https://images.unsplash.com/photo-1595428774223-ef52624120d2?auto=format&fit=crop&w=800&q=80",
  "meja-kerja-kantor-jati-solid":
    "https://images.unsplash.com/photo-1518455027359-f3f8164ba6bd?auto=format&fit=crop&w=800&q=80",
  "jendela-bulat-jati-classic":
    "https://images.unsplash.com/photo-1513694203232-719a280e022f?auto=format&fit=crop&w=800&q=80",
  "pintu-utama-jati-panel-solid":
    "https://images.unsplash.com/photo-1519710164239-da123dc03ef4?auto=format&fit=crop&w=800&q=80",
};

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
  return {
    headers: { Authorization: basicAuth(wcReadKey, wcReadSecret) },
    next: { revalidate: 15 },
  };
}

// In-Memory Stale-While-Revalidate (SWR) cache
interface CacheEntry<T> {
  data: T;
  timestamp: number;
}

const CACHE_TTL_MS = 20 * 1000; // 20 seconds fresh window

const memoryCache = {
  products: new Map<string, CacheEntry<Product[]>>(),
  categories: new Map<string, CacheEntry<Category[]>>(),
  slugProduct: new Map<string, CacheEntry<Product | null>>(),
  inFlight: new Map<string, Promise<unknown>>(),
};

export function clearProductCache(): void {
  memoryCache.products.clear();
  memoryCache.categories.clear();
  memoryCache.slugProduct.clear();
  memoryCache.inFlight.clear();
}

interface RawWcVariation {
  id: number;
  price?: string;
  regular_price?: string;
  sale_price?: string;
  on_sale?: boolean;
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
  sku?: string;
  stock_status?: string;
  date_modified?: string;
  date_modified_gmt?: string;
  description?: string;
  short_description?: string;
  images?: { src?: string; alt?: string }[];
  price?: string;
  regular_price?: string;
  sale_price?: string;
  on_sale?: boolean;
  categories?: { id: number; name: string; slug: string; name_en?: string; meta_data?: MetaItem[] }[];
  attributes?: { name: string; options?: string[]; name_en?: string }[];
  variations?: (number | ProductVariation)[];
  meta_data?: MetaItem[];
  name_en?: string;
  description_en?: string;
  short_description_en?: string;
}

function getMetaValue(meta: MetaItem[] | undefined, keyOrKeys: string | string[]): string | undefined {
  if (!meta || !Array.isArray(meta)) return undefined;
  const keys = Array.isArray(keyOrKeys) ? keyOrKeys : [keyOrKeys];
  for (const k of keys) {
    const item = meta.find((m) => m.key === k || m.key === `_${k}`);
    if (item && typeof item.value === "string" && item.value.trim()) {
      return item.value.trim();
    }
  }
  return undefined;
}

function normalizeProduct(
  raw: RawWcProduct,
  variations: ProductVariation[] = [],
  locale: string = "id"
): Product {
  const images: ProductImage[] =
    Array.isArray(raw.images) && raw.images.length > 0
      ? raw.images.map((img) => {
          const src = cleanImageSrc(img.src);
          const finalSrc =
            src === "/images/placeholder-product.svg" && SAMPLE_PRODUCT_IMAGES[raw.slug]
              ? SAMPLE_PRODUCT_IMAGES[raw.slug]
              : src;
          return {
            src: finalSrc,
            alt: img.alt && img.alt.trim() ? img.alt.trim() : raw.name,
          };
        })
      : [
          {
            src: SAMPLE_PRODUCT_IMAGES[raw.slug] || "/images/placeholder-product.svg",
            alt: raw.name,
          },
        ];

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

  const seoTitle = getMetaValue(raw.meta_data, [
    "seo_title",
    "seo_title_en",
    "_yoast_wpseo_title",
    "rank_math_title",
  ]);
  const seoDescription = getMetaValue(raw.meta_data, [
    "seo_description",
    "seo_description_en",
    "_yoast_wpseo_metadesc",
    "rank_math_description",
  ]);

  const isVariableOnSale = variations.some(
    (v) => v.on_sale || (v.regular_price && Number(v.regular_price) > Number(v.price))
  );
  const isOnSale = Boolean(
    raw.on_sale ||
      isVariableOnSale ||
      (raw.regular_price && raw.price && Number(raw.regular_price) > Number(raw.price))
  );

  let regularPrice = raw.regular_price || raw.price || "0";
  if (variations.length > 0) {
    const sortedByPrice = [...variations].sort((a, b) => {
      const pA = parseFloat(a.price || "0");
      const pB = parseFloat(b.price || "0");
      return pA - pB;
    });
    const lowestVar = sortedByPrice[0];
    if (lowestVar) {
      regularPrice = lowestVar.regular_price || lowestVar.price || regularPrice;
    }
  }

  return {
    id: raw.id,
    name: resolvedName,
    slug: raw.slug,
    description: stripHtml(rawDesc || ""),
    short_description: stripHtml(rawShortDesc || ""),
    images,
    price: raw.price || "0",
    regular_price: regularPrice,
    sale_price: raw.sale_price,
    on_sale: isOnSale,
    categories,
    attributes,
    variations,
    sku: raw.sku || undefined,
    stockStatus: (raw.stock_status as "instock" | "outofstock" | "onbackorder") || "instock",
    dateModified: raw.date_modified_gmt || raw.date_modified || undefined,
    seoTitle,
    seoDescription,
  };
}

async function fetchFreshProducts(locale: string = "id"): Promise<Product[]> {
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

    // For products on sale with variations, fetch variations so regular_price and discount are accurate
    const productsWithVars = await Promise.all(
      rawProducts.map(async (p) => {
        if (p.on_sale && p.type === "variable") {
          try {
            const varRes = await fetch(
              `${wpApiUrl}/wp-json/wc/v3/products/${p.id}/variations?per_page=100`,
              getFetchOptions()
            );
            if (varRes.ok) {
              const rawVars = (await varRes.json()) as RawWcVariation[];
              const variations: ProductVariation[] = rawVars.map((v) => ({
                id: v.id,
                price: v.price || v.sale_price || v.regular_price || p.price || "0",
                regular_price: v.regular_price || v.price || p.price || "0",
                sale_price: v.sale_price || undefined,
                on_sale: Boolean(
                  v.on_sale ||
                    (v.regular_price && v.price && Number(v.regular_price) > Number(v.price)) ||
                    (v.regular_price && v.sale_price && Number(v.regular_price) > Number(v.sale_price))
                ),
                attributes: (v.attributes || []).reduce<Record<string, string>>((acc, a) => {
                  acc[a.name.toLowerCase()] = a.option;
                  return acc;
                }, {}),
              }));
              return normalizeProduct(p, variations, locale);
            }
          } catch (e) {
            console.error(`Failed to fetch variations for on_sale product ${p.id}:`, e);
          }
        }
        return normalizeProduct(p, [], locale);
      })
    );

    return productsWithVars;
  } catch (error) {
    console.error("Error fetching WooCommerce products, falling back:", error);
    return (sampleProducts as RawWcProduct[]).map((p) => normalizeProduct(p, [], locale));
  }
}

export async function getProducts(locale: string = "id"): Promise<Product[]> {
  if (useSampleData) {
    return (sampleProducts as RawWcProduct[]).map((p) => normalizeProduct(p, [], locale));
  }

  const cacheKey = `products_${locale}`;
  const cached = memoryCache.products.get(cacheKey);
  const now = Date.now();

  if (cached) {
    // If cache is stale, trigger background revalidation
    if (now - cached.timestamp > CACHE_TTL_MS && !memoryCache.inFlight.has(cacheKey)) {
      const task = fetchFreshProducts(locale)
        .then((fresh) => {
          if (fresh && fresh.length > 0) {
            memoryCache.products.set(cacheKey, { data: fresh, timestamp: Date.now() });
          }
        })
        .finally(() => {
          memoryCache.inFlight.delete(cacheKey);
        });
      memoryCache.inFlight.set(cacheKey, task);
    }
    return cached.data;
  }

  // Deduplicate concurrent cold fetches
  if (!memoryCache.inFlight.has(cacheKey)) {
    const task = fetchFreshProducts(locale)
      .then((fresh) => {
        if (fresh && fresh.length > 0) {
          memoryCache.products.set(cacheKey, { data: fresh, timestamp: Date.now() });
        }
        return fresh;
      })
      .finally(() => {
        memoryCache.inFlight.delete(cacheKey);
      });
    memoryCache.inFlight.set(cacheKey, task);
  }

  return (await memoryCache.inFlight.get(cacheKey)) as Product[];
}

async function fetchFreshProductBySlug(slug: string, locale: string = "id"): Promise<Product | null> {
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
            price: v.price || v.sale_price || v.regular_price || rawProduct.price || "0",
            regular_price: v.regular_price || v.price || rawProduct.price || "0",
            sale_price: v.sale_price || undefined,
            on_sale: Boolean(
              v.on_sale ||
                (v.regular_price && v.price && Number(v.regular_price) > Number(v.price)) ||
                (v.regular_price && v.sale_price && Number(v.regular_price) > Number(v.sale_price))
            ),
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

export async function getProductBySlug(slug: string, locale: string = "id"): Promise<Product | null> {
  if (useSampleData) {
    const found = (sampleProducts as RawWcProduct[]).find((p) => p.slug === slug);
    return found ? normalizeProduct(found, [], locale) : null;
  }

  const cacheKey = `product_${slug}_${locale}`;
  const cached = memoryCache.slugProduct.get(cacheKey);
  const now = Date.now();

  if (cached) {
    if (now - cached.timestamp > CACHE_TTL_MS && !memoryCache.inFlight.has(cacheKey)) {
      const task = fetchFreshProductBySlug(slug, locale)
        .then((fresh) => {
          memoryCache.slugProduct.set(cacheKey, { data: fresh, timestamp: Date.now() });
        })
        .finally(() => {
          memoryCache.inFlight.delete(cacheKey);
        });
      memoryCache.inFlight.set(cacheKey, task);
    }
    return cached.data;
  }

  if (!memoryCache.inFlight.has(cacheKey)) {
    const task = fetchFreshProductBySlug(slug, locale)
      .then((fresh) => {
        memoryCache.slugProduct.set(cacheKey, { data: fresh, timestamp: Date.now() });
        return fresh;
      })
      .finally(() => {
        memoryCache.inFlight.delete(cacheKey);
      });
    memoryCache.inFlight.set(cacheKey, task);
  }

  return (await memoryCache.inFlight.get(cacheKey)) as Product | null;
}

async function fetchFreshProductById(id: number, locale: string = "id"): Promise<Product | null> {
  try {
    const res = await fetch(
      `${wpApiUrl}/wp-json/wc/v3/products/${id}`,
      getFetchOptions()
    );

    if (!res.ok) {
      const fallback = (sampleProducts as RawWcProduct[]).find((p) => p.id === id);
      return fallback ? normalizeProduct(fallback, [], locale) : null;
    }

    const rawProduct = (await res.json()) as RawWcProduct;
    if (!rawProduct || !rawProduct.id) {
      const fallback = (sampleProducts as RawWcProduct[]).find((p) => p.id === id);
      return fallback ? normalizeProduct(fallback, [], locale) : null;
    }

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
            price: v.price || v.sale_price || v.regular_price || rawProduct.price || "0",
            regular_price: v.regular_price || v.price || rawProduct.price || "0",
            sale_price: v.sale_price || undefined,
            on_sale: Boolean(
              v.on_sale ||
                (v.regular_price && v.price && Number(v.regular_price) > Number(v.price)) ||
                (v.regular_price && v.sale_price && Number(v.regular_price) > Number(v.sale_price))
            ),
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
    console.error(`Error fetching product by id ${id}:`, error);
    const fallback = (sampleProducts as RawWcProduct[]).find((p) => p.id === id);
    return fallback ? normalizeProduct(fallback, [], locale) : null;
  }
}

export async function getProductById(id: number, locale: string = "id"): Promise<Product | null> {
  if (useSampleData) {
    const found = (sampleProducts as RawWcProduct[]).find((p) => p.id === id);
    return found ? normalizeProduct(found, [], locale) : null;
  }

  const cacheKey = `product_id_${id}_${locale}`;
  const cached = memoryCache.slugProduct.get(cacheKey);
  const now = Date.now();

  if (cached) {
    if (now - cached.timestamp > CACHE_TTL_MS && !memoryCache.inFlight.has(cacheKey)) {
      const task = fetchFreshProductById(id, locale)
        .then((fresh) => {
          memoryCache.slugProduct.set(cacheKey, { data: fresh, timestamp: Date.now() });
        })
        .finally(() => {
          memoryCache.inFlight.delete(cacheKey);
        });
      memoryCache.inFlight.set(cacheKey, task);
    }
    return cached.data;
  }

  if (!memoryCache.inFlight.has(cacheKey)) {
    const task = fetchFreshProductById(id, locale)
      .then((fresh) => {
        memoryCache.slugProduct.set(cacheKey, { data: fresh, timestamp: Date.now() });
        return fresh;
      })
      .finally(() => {
        memoryCache.inFlight.delete(cacheKey);
      });
    memoryCache.inFlight.set(cacheKey, task);
  }

  return (await memoryCache.inFlight.get(cacheKey)) as Product | null;
}

const CATEGORY_DEFAULT_IMAGES: Record<string, string> = {
  "ruang-tamu": "https://images.unsplash.com/photo-1555041469-a586c61ea9bc?auto=format&fit=crop&w=800&q=80",
  "ruang-makan": "https://images.unsplash.com/photo-1617806118233-18e1de247200?auto=format&fit=crop&w=800&q=80",
  "kamar-tidur": "https://images.unsplash.com/photo-1505693416388-ac5ce068fe85?auto=format&fit=crop&w=800&q=80",
  "pintu-jendela": "https://images.unsplash.com/photo-1513694203232-719a280e022f?auto=format&fit=crop&w=800&q=80",
  "ruang-kerja": "https://images.unsplash.com/photo-1518455027359-f3f8164ba6bd?auto=format&fit=crop&w=800&q=80",
};

async function fetchFreshCategories(locale: string = "id"): Promise<Category[]> {
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
      description?: string;
      count?: number;
      image?: { src?: string };
      name_en?: string;
      meta_data?: MetaItem[];
    }[];

    if (!Array.isArray(rawCats) || rawCats.length === 0) {
      return getSampleCategories(locale);
    }

    const isEn = locale === "en";

    return rawCats.map((c) => {
      const rawName = isEn ? c.name_en || getMetaValue(c.meta_data, "name_en") || c.name : c.name;
      const decodedName = rawName.replace(/&amp;/g, "&");
      const img = c.image?.src
        ? cleanImageSrc(c.image.src)
        : CATEGORY_DEFAULT_IMAGES[c.slug] || "/images/placeholder-product.svg";

      const seoTitle = getMetaValue(c.meta_data, [
        "seo_title",
        "seo_title_en",
        "_yoast_wpseo_title",
        "rank_math_title",
      ]);
      const seoDescription = getMetaValue(c.meta_data, [
        "seo_description",
        "seo_description_en",
        "_yoast_wpseo_metadesc",
        "rank_math_description",
      ]);
      const desc = c.description ? stripHtml(c.description) : undefined;

      return {
        id: c.id,
        name: decodedName,
        slug: c.slug,
        description: desc,
        count: c.count,
        image: img,
        seoTitle,
        seoDescription,
      };
    });
  } catch (error) {
    console.error("Error fetching WooCommerce categories:", error);
    return getSampleCategories(locale);
  }
}

export async function getCategories(locale: string = "id"): Promise<Category[]> {
  if (useSampleData) {
    return getSampleCategories(locale);
  }

  const cacheKey = `categories_${locale}`;
  const cached = memoryCache.categories.get(cacheKey);
  const now = Date.now();

  if (cached) {
    if (now - cached.timestamp > CACHE_TTL_MS && !memoryCache.inFlight.has(cacheKey)) {
      const task = fetchFreshCategories(locale)
        .then((fresh) => {
          if (fresh && fresh.length > 0) {
            memoryCache.categories.set(cacheKey, { data: fresh, timestamp: Date.now() });
          }
        })
        .finally(() => {
          memoryCache.inFlight.delete(cacheKey);
        });
      memoryCache.inFlight.set(cacheKey, task);
    }
    return cached.data;
  }

  if (!memoryCache.inFlight.has(cacheKey)) {
    const task = fetchFreshCategories(locale)
      .then((fresh) => {
        if (fresh && fresh.length > 0) {
          memoryCache.categories.set(cacheKey, { data: fresh, timestamp: Date.now() });
        }
        return fresh;
      })
      .finally(() => {
        memoryCache.inFlight.delete(cacheKey);
      });
    memoryCache.inFlight.set(cacheKey, task);
  }

  return (await memoryCache.inFlight.get(cacheKey)) as Category[];
}

// Warm up cache in background on startup
if (!useSampleData && wpApiUrl) {
  setTimeout(() => {
    getProducts("id").catch(() => {});
    getCategories("id").catch(() => {});
  }, 100);
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
          image: CATEGORY_DEFAULT_IMAGES[c.slug] || "/images/placeholder-product.svg",
        });
      }
    }
  }
  return cats;
}

export async function getCategoryBySlug(slug: string, locale: string = "id"): Promise<Category | null> {
  const categories = await getCategories(locale);
  return categories.find((c) => c.slug === slug) || null;
}

export async function getProductsByCategory(categorySlug: string, locale: string = "id"): Promise<Product[]> {
  const products = await getProducts(locale);
  return products.filter((p) => p.categories.some((c) => c.slug === categorySlug));
}

// 301 Redirect map for historical or changed product slugs
export const HISTORICAL_SLUG_REDIRECTS: Record<string, string> = {
  "meja-makan-minimalis": "meja-makan-jati-minimalis",
  "kursi-ropan": "kursi-makan-jati-ropan",
  "dipan-spindle": "dipan-tempat-tidur-jati-spindle",
};

export function getRedirectForSlug(oldSlug: string): string | null {
  return HISTORICAL_SLUG_REDIRECTS[oldSlug] || null;
}
