import { supabase } from "../config/supabase.js";

export async function createOrder({ items, total_amount }) {
  const { data, error } = await supabase
    .from("orders")
    .insert({
      items,
      total_amount,
      payment_status: "Pending",
    })
    .select("id,items,total_amount,payment_status,created_at")
    .single();

  if (error) throw error;
  return data;
}

export async function listOrders() {
  const { data, error } = await supabase
    .from("orders")
    .select("id,items,total_amount,payment_status,created_at")
    .order("created_at", { ascending: false });

  if (error) throw error;
  return data ?? [];
}

export async function updateOrderPaymentStatus({ id, payment_status }) {
  const { data, error } = await supabase
    .from("orders")
    .update({ payment_status })
    .eq("id", id)
    .select("id,items,total_amount,payment_status,created_at")
    .single();

  if (error) throw error;
  return data;
}

