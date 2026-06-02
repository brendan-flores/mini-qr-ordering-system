import { supabase } from "../config/supabase.js";

export async function listProducts() {
  const { data, error } = await supabase
    .from("products")
    .select("id,name,price,image_url,created_at")
    .order("created_at", { ascending: false });

  if (error) throw error;
  return data ?? [];
}

