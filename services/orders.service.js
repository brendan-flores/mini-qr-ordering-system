import "../config/env.js";
import { getSupabase, getSupabaseConfig } from "../config/supabase.js";
import {
  createMockOrder,
  listMockOrders,
  updateMockOrderPaymentStatus,
} from "./mock-data.service.js";

export async function createOrder({
  items,
  total_amount,
  payment_method = "cod",
  payment_status,
}) {
  const supabase = getSupabase();
  const status =
    payment_status ??
    (payment_method === "cod" ? "Pending" : "Paid");

  if (!getSupabaseConfig().isConfigured || !supabase) {
    return createMockOrder({
      items,
      total_amount,
      payment_method,
      payment_status: status,
    });
  }

  const { data, error } = await supabase
    .from("orders")
    .insert({
      items,
      total_amount,
      payment_method,
      payment_status: status,
    })
    .select(
      "id,items,total_amount,payment_method,payment_status,created_at"
    )
    .single();

  if (error) throw error;
  return data;
}

export async function listOrders() {
  const supabase = getSupabase();
  if (!getSupabaseConfig().isConfigured || !supabase) {
    return listMockOrders();
  }

  const { data, error } = await supabase
    .from("orders")
    .select(
      "id,items,total_amount,payment_method,payment_status,created_at"
    )
    .order("created_at", { ascending: false });

  if (error) throw error;
  return data ?? [];
}

export async function updateOrderPaymentStatus({ id, payment_status }) {
  const supabase = getSupabase();
  if (!getSupabaseConfig().isConfigured || !supabase) {
    return updateMockOrderPaymentStatus({ id, payment_status });
  }

  const { data, error } = await supabase
    .from("orders")
    .update({ payment_status })
    .eq("id", id)
    .select(
      "id,items,total_amount,payment_method,payment_status,created_at"
    )
    .single();

  if (error) throw error;
  return data;
}
