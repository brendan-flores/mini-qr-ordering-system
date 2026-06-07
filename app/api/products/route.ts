import { NextResponse } from "next/server";
import { isMysqlConfigured, mysqlConfigError } from "@/lib/server/db/db";
import { listProducts } from "@/lib/server/db/products";
import { withResolvedProductDescriptions } from "@/lib/shared/products/product-descriptions";
import { withResolvedProductImages } from "@/lib/shared/products/product-images";
import { getErrorMessage } from "@/lib/server/services/db-errors";

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
