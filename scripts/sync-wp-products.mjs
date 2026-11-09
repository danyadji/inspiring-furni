import fs from "fs";
import path from "path";
import sharp from "sharp";

const WP_API_URL = process.env.WP_API_URL || "http://localhost/inspiring-furni/wordpress";
const WC_KEY = process.env.WC_READ_KEY || "ck_d896d22d53f24ac23c9f62699c5e3416ea29c2cd";
const WC_SECRET = process.env.WC_READ_SECRET || "cs_76b14e20def02a954f9504ebd9624cb0e4ce9b7f";

const auth = Buffer.from(`${WC_KEY}:${WC_SECRET}`).toString("base64");
const headers = { Authorization: `Basic ${auth}` };

const imagesDir = path.join(process.cwd(), "public", "images", "products");
if (!fs.existsSync(imagesDir)) {
  fs.mkdirSync(imagesDir, { recursive: true });
}

function cleanSlug(text) {
  return text
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");
}

function stripHtml(html) {
  if (!html) return "";
  return html.replace(/<[^>]*>?/gm, "").trim();
}

async function downloadAndOptimizeImage(url, targetFilename) {
  const filePath = path.join(imagesDir, targetFilename);
  // Replace https with http for localhost
  const normalizedUrl = url.replace(/^https:\/\/localhost\//, "http://localhost/");

  console.log(`Downloading ${normalizedUrl} -> ${targetFilename}...`);
  const res = await fetch(normalizedUrl);
  if (!res.ok) {
    throw new Error(`Failed to download ${url}: ${res.status}`);
  }

  const arrayBuf = await res.arrayBuffer();
  const rawBuf = Buffer.from(arrayBuf);

  // Resize & optimize via sharp
  const optimized = await sharp(rawBuf)
    .resize(1600, 1600, { fit: "inside", withoutEnlargement: true })
    .png({ quality: 85, compressionLevel: 8 })
    .toBuffer();

  fs.writeFileSync(filePath, optimized);
  console.log(`Saved ${targetFilename} (${Math.round(optimized.length / 1024)} KB, original was ${Math.round(rawBuf.length / 1024)} KB)`);
  return `/images/products/${targetFilename}`;
}

async function main() {
  console.log(`\n=== Sinkronisasi Produk dari WooCommerce ke Next.js ===`);
  console.log(`Menghubungkan ke: ${WP_API_URL}`);

  const productsRes = await fetch(`${WP_API_URL}/wp-json/wc/v3/products?per_page=100&status=publish`, {
    headers,
  });

  if (!productsRes.ok) {
    throw new Error(`Gagal mengambil produk dari WooCommerce: ${productsRes.status} ${productsRes.statusText}`);
  }

  const rawProducts = await productsRes.json();
  console.log(`Ditemukan ${rawProducts.length} produk publish di WordPress.\n`);

  const syncedProducts = [];

  for (const raw of rawProducts) {
    console.log(`Memproses [ID ${raw.id}] ${raw.name}...`);

    // Download images
    const localImages = [];
    if (Array.isArray(raw.images)) {
      for (let i = 0; i < raw.images.length; i++) {
        const img = raw.images[i];
        const ext = "png";
        const filename = `${raw.slug}-${i + 1}.${ext}`;
        try {
          const localSrc = await downloadAndOptimizeImage(img.src, filename);
          localImages.push({
            src: localSrc,
            alt: img.alt && img.alt.trim() ? img.alt.trim() : raw.name,
          });
        } catch (e) {
          console.error(`Gagal download foto ${img.src}:`, e.message);
        }
      }
    }

    if (localImages.length === 0) {
      localImages.push({
        src: "/images/placeholder-product.svg",
        alt: raw.name,
      });
    }

    // Fetch variations if variable
    const variations = [];
    if (raw.type === "variable") {
      try {
        const varRes = await fetch(
          `${WP_API_URL}/wp-json/wc/v3/products/${raw.id}/variations?per_page=100`,
          { headers }
        );
        if (varRes.ok) {
          const rawVars = await varRes.json();
          for (const v of rawVars) {
            const attrMap = {};
            for (const a of v.attributes || []) {
              attrMap[a.name.toLowerCase()] = a.option;
            }
            variations.push({
              id: v.id,
              price: v.price || v.sale_price || v.regular_price || raw.price || "0",
              regular_price: v.regular_price || v.price || raw.price || "0",
              sale_price: v.sale_price || undefined,
              on_sale: Boolean(
                v.on_sale ||
                (v.regular_price && v.price && Number(v.regular_price) > Number(v.price))
              ),
              attributes: attrMap,
            });
          }
        }
      } catch (e) {
        console.error(`Gagal mengambil variasi produk ${raw.id}:`, e.message);
      }
    }

    // Lowest price
    let lowestPrice = raw.price || "0";
    let regularPrice = raw.regular_price || raw.price || "0";
    if (variations.length > 0) {
      const sorted = [...variations].sort((a, b) => parseFloat(a.price) - parseFloat(b.price));
      lowestPrice = sorted[0].price || lowestPrice;
      regularPrice = sorted[0].regular_price || sorted[0].price || regularPrice;
    }

    const isOnSale = Boolean(
      raw.on_sale ||
      (regularPrice && lowestPrice && Number(regularPrice) > Number(lowestPrice)) ||
      variations.some((v) => v.on_sale)
    );

    const categories = (raw.categories || []).map((c) => ({
      id: c.id,
      name: c.name.replace(/&amp;/g, "&"),
      slug: c.slug,
    }));

    const attributes = (raw.attributes || []).map((a) => ({
      name: a.name,
      options: a.options || [],
    }));

    syncedProducts.push({
      id: raw.id,
      name: raw.name,
      slug: raw.slug,
      description: raw.description,
      short_description: raw.short_description || stripHtml(raw.description).slice(0, 150),
      images: localImages,
      price: lowestPrice,
      regular_price: regularPrice,
      sale_price: raw.sale_price || undefined,
      on_sale: isOnSale,
      categories,
      attributes,
      variations,
      sku: raw.sku || undefined,
      stockStatus: raw.stock_status || "instock",
    });
  }

  const samplePath = path.join(process.cwd(), "src", "data", "sample-products.json");
  fs.writeFileSync(samplePath, JSON.stringify(syncedProducts, null, 2), "utf8");
  console.log(`\nSelesai! Berhasil menyimpan ${syncedProducts.length} produk asli ke:`);
  console.log(samplePath);
}

main().catch((err) => {
  console.error("Error saat sinkronisasi:", err);
  process.exit(1);
});

