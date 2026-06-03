import { NextResponse } from "next/server";
import { withResolvedProductDescriptions } from "@/lib/product-descriptions";
import { withResolvedProductImages } from "@/lib/product-images";
import { getSupabaseAdmin, isSupabaseConfigured } from "@/lib/supabase/server";
import { listMockProducts } from "../../../services/mock-data.service.js";

export async function GET() {
  try {
    if (!isSupabaseConfigured()) {
      return NextResponse.json({
        data: withResolvedProductDescriptions(
          withResolvedProductImages(listMockProducts())
        ),
      });
    }

    const supabase = getSupabaseAdmin();
    const { data, error } = await supabase
      .from("products")
      .select("id,name,price,category,image_url,created_at")
      .order("created_at", { ascending: false });

    if (error) {
      return NextResponse.json({ error: { message: error.message } }, { status: 500 });
    }

    return NextResponse.json({
      data: withResolvedProductDescriptions(
        withResolvedProductImages(data ?? [])
      ),
    });
  } catch (error: unknown) {
    const message =
      error instanceof Error ? error.message : "Internal Server Error";
    return NextResponse.json({ error: { message } }, { status: 500 });
  }
}
