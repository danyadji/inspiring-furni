import { NextRequest, NextResponse } from "next/server";
import { getProductBySlug, getProductById } from "@/lib/products";
import { formatRupiah } from "@/lib/format";
import idMessages from "../../../../messages/id.json";
import enMessages from "../../../../messages/en.json";
import crypto from "crypto";

interface OrderItemPayload {
  productId: number;
  productSlug?: string;
  productName?: string;
  variationId: number;
  attributes?: Record<string, string>;
  quantity: number;
}

interface OrderRequestPayload {
  customerName: string;
  customerEmail?: string;
  customerPhone?: string;
  customerAddress: string;
  customerCity?: string;
  customerPostcode?: string;
  items: OrderItemPayload[];
  locale?: string;
  website?: string; // Honeypot field for bot detection
}

const wpApiUrl = process.env.WP_API_URL ?? "";
const wcOrderKey = process.env.WC_ORDER_KEY ?? "";
const wcOrderSecret = process.env.WC_ORDER_SECRET ?? "";
const isVercelLocalhost =
  process.env.NODE_ENV === "production" &&
  (wpApiUrl.includes("localhost") || wpApiUrl.includes("127.0.0.1"));
const useSampleData =
  process.env.USE_SAMPLE_DATA === "true" || !wpApiUrl || isVercelLocalhost;
const waNumber = process.env.NEXT_PUBLIC_WA_NUMBER || "6289518906727";

function basicAuth(key: string, secret: string): string {
  return "Basic " + Buffer.from(`${key}:${secret}`).toString("base64");
}

function getClientIp(req: NextRequest): string {
  const forwarded = req.headers.get("x-forwarded-for");
  if (forwarded) {
    return forwarded.split(",")[0].trim();
  }
  return req.headers.get("x-real-ip") || "127.0.0.1";
}

// In-memory rate limiting: max 5 orders per minute per IP
const ipRateLimitMap = new Map<string, { count: number; expiresAt: number }>();

// In-memory idempotency deduplication cache: 15 seconds window
interface CachedOrderResponse {
  success: boolean;
  orderId: string;
  subtotal: number;
  whatsappUrl: string;
  waUrl: string;
  timestamp: number;
}
const recentOrdersCache = new Map<string, CachedOrderResponse>();

function cleanExpiredCache() {
  const now = Date.now();
  for (const [ip, entry] of ipRateLimitMap.entries()) {
    if (entry.expiresAt < now) {
      ipRateLimitMap.delete(ip);
    }
  }
  for (const [key, entry] of recentOrdersCache.entries()) {
    if (now - entry.timestamp > 20000) {
      recentOrdersCache.delete(key);
    }
  }
}

export async function POST(req: NextRequest) {
  try {
    cleanExpiredCache();

    const clientIp = getClientIp(req);
    const now = Date.now();

    // 1. Rate limiting check (max 5 order submissions per 60 seconds per IP)
    const rateLimit = ipRateLimitMap.get(clientIp);
    if (rateLimit && rateLimit.expiresAt > now) {
      if (rateLimit.count >= 5) {
        return NextResponse.json(
          {
            error:
              "Terlalu banyak permintaan pemesanan. Mohon tunggu satu menit sebelum mencoba kembali.",
          },
          { status: 429 }
        );
      }
      rateLimit.count += 1;
    } else {
      ipRateLimitMap.set(clientIp, { count: 1, expiresAt: now + 60000 });
    }

    const body = (await req.json()) as OrderRequestPayload;
    const {
      customerName = "",
      customerEmail = "",
      customerPhone = "",
      customerAddress = "",
      customerCity = "",
      customerPostcode = "",
      items,
      locale = "id",
      website = "",
    } = body;

    // 2. Honeypot check: if hidden honeypot field is filled, reject silently
    if (website && typeof website === "string" && website.trim().length > 0) {
      return NextResponse.json(
        {
          success: true,
          orderId: "IF-OK",
          subtotal: 0,
          whatsappUrl: "",
          waUrl: "",
        },
        { status: 200 }
      );
    }

    const messages = locale === "en" ? enMessages.WhatsApp : idMessages.WhatsApp;

    // 3. Input validation and sanitization
    if (!customerName || typeof customerName !== "string" || !customerName.trim()) {
      return NextResponse.json(
        { error: locale === "en" ? "Customer name is required." : "Nama pemesan wajib diisi." },
        { status: 400 }
      );
    }

    if (customerName.length > 100) {
      return NextResponse.json(
        { error: locale === "en" ? "Customer name is too long." : "Nama pemesan terlalu panjang (maks 100 karakter)." },
        { status: 400 }
      );
    }

    if (!customerAddress || typeof customerAddress !== "string" || !customerAddress.trim()) {
      return NextResponse.json(
        { error: locale === "en" ? "Delivery address is required." : "Alamat pengiriman wajib diisi." },
        { status: 400 }
      );
    }

    if (customerAddress.length > 500) {
      return NextResponse.json(
        { error: locale === "en" ? "Address is too long." : "Alamat pengiriman terlalu panjang (maks 500 karakter)." },
        { status: 400 }
      );
    }

    if (!Array.isArray(items) || items.length === 0) {
      return NextResponse.json(
        { error: locale === "en" ? "Shopping cart cannot be empty." : "Keranjang belanja tidak boleh kosong." },
        { status: 400 }
      );
    }

    if (items.length > 50) {
      return NextResponse.json(
        { error: locale === "en" ? "Too many items in cart." : "Jumlah jenis produk dalam keranjang melebihi batas." },
        { status: 400 }
      );
    }

    // 4. Deduplication / Idempotency Check
    // If the identical order is sent within 15 seconds, return the already created order
    const orderFingerprint = crypto
      .createHash("sha256")
      .update(
        `${clientIp}:${customerName.trim().toLowerCase()}:${customerAddress.trim().toLowerCase()}:${items
          .map((it) => `${it.productId}-${it.variationId}-${it.quantity}`)
          .sort()
          .join(",")}`
      )
      .digest("hex");

    const cachedOrder = recentOrdersCache.get(orderFingerprint);
    if (cachedOrder && now - cachedOrder.timestamp < 15000) {
      return NextResponse.json(cachedOrder);
    }

    // 5. Fetch server product data with variations to accurately verify prices
    let totalSubtotal = 0;
    const lineItemDetails: {
      productName: string;
      variantText: string;
      quantity: number;
      unitPrice: number;
      lineSubtotal: number;
      productId: number;
      variationId: number;
    }[] = [];

    for (const item of items) {
      const product = item.productSlug
        ? await getProductBySlug(item.productSlug, locale)
        : await getProductById(item.productId, locale);

      if (!product) {
        continue;
      }

      // Find exact variation from WooCommerce product data
      const variation =
        product.variations && product.variations.length > 0
          ? product.variations.find((v) => v.id === item.variationId)
          : undefined;

      const rawPrice = variation ? variation.price : product.price;
      const unitPrice = parseFloat(rawPrice) || 0;
      const qty = Math.max(1, Math.min(999, Math.floor(Number(item.quantity) || 1)));
      const lineSubtotal = unitPrice * qty;
      totalSubtotal += lineSubtotal;

      let variantDetails = "";
      if (variation) {
        variantDetails = Object.entries(variation.attributes)
          .map(([k, v]) => `${k}: ${v}`)
          .join(", ");
      } else if (item.attributes && Object.keys(item.attributes).length > 0) {
        variantDetails = Object.entries(item.attributes)
          .map(([k, v]) => `${k}: ${v}`)
          .join(", ");
      }

      lineItemDetails.push({
        productName: product.name,
        variantText: variantDetails,
        quantity: qty,
        unitPrice,
        lineSubtotal,
        productId: product.id,
        variationId: variation ? variation.id : (item.variationId || product.id),
      });
    }

    if (lineItemDetails.length === 0) {
      return NextResponse.json(
        { error: locale === "en" ? "No valid products ordered." : "Tidak ada produk valid yang dipesan." },
        { status: 400 }
      );
    }

    // 6. Record order to WooCommerce or generate reference
    let orderId = `IF-${Math.floor(1000 + Math.random() * 9000)}`;

    if (!useSampleData && wpApiUrl && wcOrderKey && wcOrderSecret) {
      try {
        const wcResponse = await fetch(`${wpApiUrl}/wp-json/wc/v3/orders`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: basicAuth(wcOrderKey, wcOrderSecret),
          },
          body: JSON.stringify({
            status: "on-hold",
            currency: "IDR",
            payment_method: "bacs",
            payment_method_title: "Transfer Bank / WhatsApp (DP & Kargo Jepara)",
            set_paid: false,
            customer_note: "Pesanan via Web Inspiring Furni (Checkout WhatsApp). Menunggu konfirmasi ongkir kargo truk Jepara.",
            billing: {
              first_name: customerName.trim(),
              email: customerEmail.trim() || undefined,
              phone: customerPhone.trim() || undefined,
              address_1: customerAddress.trim(),
              city: customerCity.trim() || undefined,
              postcode: customerPostcode.trim() || undefined,
            },
            shipping: {
              first_name: customerName.trim(),
              address_1: customerAddress.trim(),
              city: customerCity.trim() || undefined,
              postcode: customerPostcode.trim() || undefined,
            },
            line_items: lineItemDetails.map((li) => ({
              product_id: li.productId,
              variation_id: li.variationId !== li.productId ? li.variationId : undefined,
              quantity: li.quantity,
              meta_data: li.variantText
                ? [
                    {
                      key: "Varian",
                      value: li.variantText,
                    },
                  ]
                : [],
            })),
            meta_data: [
              {
                key: "_checkout_source",
                value: "Inspiring Furni Web (WhatsApp Checkout)",
              },
              {
                key: "_customer_phone",
                value: customerPhone.trim() || "-",
              },
              {
                key: "_shipping_type",
                value: "Kargo Truk Jepara (Konfirmasi via WhatsApp)",
              },
            ],
          }),
        });

        if (wcResponse.ok) {
          const wcOrder = await wcResponse.json();
          if (wcOrder && wcOrder.id) {
            orderId = `${wcOrder.id}`;
          }
        }
      } catch (wcErr) {
        console.error("WooCommerce order recording error:", wcErr);
      }
    }

    // 7. Compose WhatsApp message using translation template
    const header = messages.orderHeader.replace("{orderId}", orderId);
    let message = header;

    lineItemDetails.forEach((li, index) => {
      const variantStr =
        li.variantText && li.variantText !== "Standar" && li.variantText !== "Standard"
          ? ` (${li.variantText})`
          : "";
      message += `${index + 1}. ${li.productName}${variantStr} x ${li.quantity} = ${formatRupiah(li.lineSubtotal)}\n`;
    });

    message += `\n${messages.subtotalLabel.replace("{amount}", formatRupiah(totalSubtotal))}\n\n`;
    message += `${messages.contactHeader || "Data Pemesan:"}\n`;
    message += `${messages.nameLabel.replace("{name}", customerName.trim())}\n`;
    if (customerPhone.trim()) {
      const phoneLbl = messages.phoneLabel || "No. WhatsApp: {phone}";
      message += `${phoneLbl.replace("{phone}", customerPhone.trim())}\n`;
    }
    if (customerEmail.trim()) {
      const emailLbl = messages.emailLabel || "Email: {email}";
      message += `${emailLbl.replace("{email}", customerEmail.trim())}\n`;
    }
    message += `${messages.addressLabel.replace("{address}", customerAddress.trim())}\n`;
    if (customerCity.trim()) {
      const cityLbl = messages.cityLabel || "Kota: {city}";
      message += `${cityLbl.replace("{city}", customerCity.trim())}\n`;
    }
    if (customerPostcode.trim()) {
      const postLbl = messages.postalCodeLabel || "Kode Pos: {postcode}";
      message += `${postLbl.replace("{postcode}", customerPostcode.trim())}\n`;
    }
    message += `\n${messages.closing}`;

    const encodedMessage = encodeURIComponent(message);
    const whatsappUrl = `https://wa.me/${waNumber}?text=${encodedMessage}`;

    const orderResult: CachedOrderResponse = {
      success: true,
      orderId,
      subtotal: totalSubtotal,
      whatsappUrl,
      waUrl: whatsappUrl,
      timestamp: now,
    };

    // Save to deduplication cache
    recentOrdersCache.set(orderFingerprint, orderResult);

    return NextResponse.json(orderResult);
  } catch (error) {
    console.error("API /api/order error:", error);
    return NextResponse.json(
      { error: "Terjadi kesalahan pada server saat memproses pesanan." },
      { status: 500 }
    );
  }
}
