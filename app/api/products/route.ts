import { NextResponse } from "next/server";
import { isMysqlConfigured, mysqlConfigError } from "@/lib/mysql/db";
import { listProducts } from "@/lib/mysql/products";
import { withResolvedProductDescriptions } from "@/lib/product-descriptions";
import { withResolvedProductImages } from "@/lib/product-images";
import { getErrorMessage } from "@/lib/orders/db-errors";

export async function GET() {
  try {
    if (!isMysqlConfigured()) {
      return NextResponse.json(
        { error: { message: mysqlConfigError() } },
        { status: 503 }
      );
    }

    const data = await listProducts();
    return NextResponse.json({
      data: withResolvedProductDescriptions(withResolvedProductImages(data)),
    });
  } catch (error: unknown) {
    return NextResponse.json(
      { error: { message: getErrorMessage(error) } },
      { status: 500 }
    );
  }
}
