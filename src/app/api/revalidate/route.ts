import { NextRequest, NextResponse } from "next/server";
import { revalidatePath } from "next/cache";
import { clearProductCache } from "@/lib/products";
import crypto from "crypto";

// Timing-safe string comparison to prevent timing oracle attacks
function timingSafeStringEqual(a: string, b: string): boolean {
  try {
    const aBuf = Buffer.from(a);
    const bBuf = Buffer.from(b);
    if (aBuf.length !== bBuf.length) return false;
    return crypto.timingSafeEqual(aBuf, bBuf);
  } catch {
    return false;
  }
}

function isValidSecret(request: NextRequest, rawBody?: string): boolean {
  const configuredSecret = process.env.REVALIDATE_SECRET;
  if (!configuredSecret) {
    // Fail closed in production: deny all requests if secret is not configured
    if (process.env.NODE_ENV === "production") {
      console.error(
        "REVALIDATE_SECRET is not set in production — denying all revalidation requests."
      );
      return false;
    }
    // Allow in development with a warning
    console.warn("REVALIDATE_SECRET environment variable is not defined.");
    return true;
  }

  // 1. Direct secret token via query param or header (timing-safe compare)
  const tokenFromQuery = request.nextUrl.searchParams.get("secret") ?? "";
  const tokenFromHeader = request.headers.get("x-revalidate-secret") ?? "";

  if (
    timingSafeStringEqual(tokenFromQuery, configuredSecret) ||
    timingSafeStringEqual(tokenFromHeader, configuredSecret)
  ) {
    return true;
  }

  // 2. WooCommerce Webhook HMAC SHA256 Signature verification
  const wcSignature = request.headers.get("x-wc-webhook-signature");
  if (wcSignature && rawBody) {
    try {
      const hmac = crypto.createHmac("sha256", configuredSecret);
      const digest = hmac.update(rawBody).digest("base64");
      if (crypto.timingSafeEqual(Buffer.from(wcSignature), Buffer.from(digest))) {
        return true;
      }
    } catch (sigErr) {
      console.error("WooCommerce webhook signature verification failed:", sigErr);
    }
  }

  return false;
}

export async function GET(request: NextRequest) {
  if (!isValidSecret(request)) {
    return NextResponse.json(
      { revalidated: false, error: "Unauthorized: Invalid or missing revalidation secret token" },
      { status: 401 }
    );
  }

  clearProductCache();

  const specificSlug = request.nextUrl.searchParams.get("slug");
  const paths: string[] = ["/", "/id", "/en", "/id/produk", "/en/produk"];

  if (specificSlug) {
    paths.push(`/id/produk/${specificSlug}`, `/en/produk/${specificSlug}`);
  }

  for (const p of paths) {
    revalidatePath(p);
  }
  revalidatePath("/", "layout");

  return NextResponse.json({
    revalidated: true,
    message: "Product and category cache successfully cleared",
    revalidatedPaths: paths,
    timestamp: Date.now(),
  });
}

export async function POST(request: NextRequest) {
  let rawBody = "";
  let payload: Record<string, unknown> | null = null;

  try {
    rawBody = await request.text();
    if (rawBody.trim()) {
      payload = JSON.parse(rawBody);
    }
  } catch {
    // rawBody remains as raw text if not JSON
  }

  if (!isValidSecret(request, rawBody)) {
    return NextResponse.json(
      { revalidated: false, error: "Unauthorized: Invalid or missing revalidation secret token" },
      { status: 401 }
    );
  }

  clearProductCache();

  const paths: string[] = ["/", "/id", "/en", "/id/produk", "/en/produk"];

  // Detect product slug from WooCommerce Webhook payload
  let detectedSlug: string | null = null;
  if (payload && typeof payload === "object") {
    if (typeof payload.slug === "string" && payload.slug) {
      detectedSlug = payload.slug;
    } else if (typeof payload.permalink === "string") {
      const match = payload.permalink.match(/\/product\/([^/]+)/);
      if (match) detectedSlug = match[1];
    }
  }

  const querySlug = request.nextUrl.searchParams.get("slug");
  const slugToRevalidate = querySlug || detectedSlug;

  if (slugToRevalidate) {
    paths.push(`/id/produk/${slugToRevalidate}`, `/en/produk/${slugToRevalidate}`);
  }

  for (const p of paths) {
    revalidatePath(p);
  }
  revalidatePath("/", "layout");

  return NextResponse.json({
    revalidated: true,
    message: "Product cache and static pages revalidated successfully",
    productSlug: slugToRevalidate || null,
    revalidatedPaths: paths,
    timestamp: Date.now(),
  });
}
