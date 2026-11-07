import { NextResponse } from "next/server";
import { revalidatePath } from "next/cache";
import { clearProductCache } from "@/lib/products";

export async function GET() {
  clearProductCache();
  revalidatePath("/", "layout");

  return NextResponse.json({
    revalidated: true,
    message: "Product and category cache successfully cleared",
    timestamp: Date.now(),
  });
}

export async function POST() {
  clearProductCache();
  revalidatePath("/", "layout");

  return NextResponse.json({
    revalidated: true,
    message: "Product and category cache successfully cleared",
    timestamp: Date.now(),
  });
}

