import { NextResponse } from "next/server";
import { listProducts } from "../../../services/products.service.js";

export async function GET() {
  try {
    const products = await listProducts();
    return NextResponse.json({ data: products });
  } catch (error: unknown) {
    const message =
      error instanceof Error ? error.message : "Internal Server Error";
    return NextResponse.json({ error: { message } }, { status: 500 });
  }
}
