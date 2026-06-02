import { hasSupabaseConfig, supabase } from "../config/supabase.js";
import {
  createMockOrder,
  listMockOrders,
  updateMockOrderPaymentStatus,
} from "./mock-data.service.js";

export async function createOrder({ items, total_amount }) {
  if (!hasSupabaseConfig || !supabase) {
    return createMockOrder({ items, total_amount });
  }

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
  if (!hasSupabaseConfig || !supabase) {
    return listMockOrders();
  }

  const { data, error } = await supabase
    .from("orders")
    .select("id,items,total_amount,payment_status,created_at")
    .order("created_at", { ascending: false });

  if (error) throw error;
  return data ?? [];
}

export async function updateOrderPaymentStatus({ id, payment_status }) {
  if (!hasSupabaseConfig || !supabase) {
    return updateMockOrderPaymentStatus({ id, payment_status });
  }

  const { data, error } = await supabase
    .from("orders")
    .update({ payment_status })
    .eq("id", id)
    .select("id,items,total_amount,payment_status,created_at")
    .single();

  if (error) throw error;
  return data;
}

