import { NextRequest, NextResponse } from "next/server";
import { getProducts, Product } from "@/lib/products";
import { formatRupiah } from "@/lib/format";
import idMessages from "../../../../messages/id.json";
import enMessages from "../../../../messages/en.json";

interface OrderItemPayload {
  productId: number;
  variationId: number;
  quantity: number;
}

interface OrderRequestPayload {
  customerName: string;
  customerAddress: string;
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
    const { customerName, customerAddress, items, locale = "id" } = body;

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

    // 2. Fetch server product data to verify prices
    const serverProducts = await getProducts(locale);
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
      const product = serverProducts.find((p: Product) => p.id === item.productId);
      if (!product) {
        continue;
      }

      const variation =
        product.variations.find((v) => v.id === item.variationId) || product.variations[0];
      const unitPrice = variation ? parseInt(variation.price, 10) : parseInt(product.price, 10);
      const qty = Math.max(1, Math.floor(item.quantity));
      const lineSubtotal = unitPrice * qty;
      totalSubtotal += lineSubtotal;

      const variantDetails = variation
        ? Object.values(variation.attributes).join(", ")
        : (locale === "en" ? "Standard" : "Standar");

      lineItemDetails.push({
        productName: product.name,
        variantText: variantDetails,
        quantity: qty,
        unitPrice,
        lineSubtotal,
        productId: product.id,
        variationId: variation ? variation.id : product.id,
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
            billing: {
              first_name: customerName.trim(),
              address_1: customerAddress.trim(),
            },
            shipping: {
              first_name: customerName.trim(),
              address_1: customerAddress.trim(),
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

    message += `\n${messages.subtotalLabel.replace("{amount}", formatRupiah(totalSubtotal))}\n`;
    message += `${messages.nameLabel.replace("{name}", customerName.trim())}\n`;
    message += `${messages.addressLabel.replace("{address}", customerAddress.trim())}\n\n`;
    message += messages.closing;

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
