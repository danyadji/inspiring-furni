import { NextRequest, NextResponse } from "next/server";
import { getProductBySlug, getProductById } from "@/lib/products";
import { formatRupiah } from "@/lib/format";
import idMessages from "../../../../messages/id.json";
import enMessages from "../../../../messages/en.json";

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

export async function POST(req: NextRequest) {
  try {
    const body = (await req.json()) as OrderRequestPayload;
    const {
      customerName,
      customerEmail = "",
      customerPhone = "",
      customerAddress,
      customerCity = "",
      customerPostcode = "",
      items,
      locale = "id",
    } = body;

    const messages = locale === "en" ? enMessages.WhatsApp : idMessages.WhatsApp;

    // 1. Validation
    if (!customerName || typeof customerName !== "string" || !customerName.trim()) {
      return NextResponse.json(
        { error: locale === "en" ? "Customer name is required." : "Nama pemesan wajib diisi." },
        { status: 400 }
      );
    }

    if (!customerAddress || typeof customerAddress !== "string" || !customerAddress.trim()) {
      return NextResponse.json(
        { error: locale === "en" ? "Delivery address is required." : "Alamat pengiriman wajib diisi." },
        { status: 400 }
      );
    }

    if (!Array.isArray(items) || items.length === 0) {
      return NextResponse.json(
        { error: locale === "en" ? "Shopping cart cannot be empty." : "Keranjang belanja tidak boleh kosong." },
        { status: 400 }
      );
    }

    // 2. Fetch server product data with variations to accurately verify prices
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
        product.variations.find((v) => v.id === item.variationId) || product.variations[0];
      const unitPrice = variation ? parseInt(variation.price, 10) : parseInt(product.price, 10);
      const qty = Math.max(1, Math.floor(item.quantity));
      const lineSubtotal = unitPrice * qty;
      totalSubtotal += lineSubtotal;

      // Extract clear variant labels: prefer item.attributes or variation attributes
      let variantDetails = "";
      if (item.attributes && Object.keys(item.attributes).length > 0) {
        variantDetails = Object.entries(item.attributes)
          .map(([k, v]) => `${k.charAt(0).toUpperCase() + k.slice(1)}: ${v}`)
          .join(", ");
      } else if (variation && Object.keys(variation.attributes).length > 0) {
        variantDetails = Object.entries(variation.attributes)
          .map(([k, v]) => `${k.charAt(0).toUpperCase() + k.slice(1)}: ${v}`)
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

    // 3. Record order to WooCommerce or generate reference
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
            })),
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

    // 4. Compose WhatsApp message using translation template
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

    return NextResponse.json({
      success: true,
      orderId,
      subtotal: totalSubtotal,
      whatsappUrl,
      waUrl: whatsappUrl,
    });
  } catch (error) {
    console.error("API /api/order error:", error);
    return NextResponse.json(
      { error: "Terjadi kesalahan pada server saat memproses pesanan." },
      { status: 500 }
    );
  }
}
