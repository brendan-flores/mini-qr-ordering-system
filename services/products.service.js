import { hasSupabaseConfig, supabase } from "../config/supabase.js";
import { listMockProducts } from "./mock-data.service.js";

export async function listProducts() {
  if (!hasSupabaseConfig || !supabase) {
    return listMockProducts();
  }

  const { data, error } = await supabase
    .from("products")
    .select("id,name,price,category,image_url,created_at")
    .order("created_at", { ascending: false });

  if (error) throw error;
  return data ?? [];
}

