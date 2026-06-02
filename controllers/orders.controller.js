import { z } from "zod";
import {
  createOrder,
  listOrders,
  updateOrderPaymentStatus,
} from "../services/orders.service.js";

const OrderItemSchema = z.object({
  product_id: z.union([z.string().uuid(), z.number()]),
  name: z.string().min(1),
  price: z.number().nonnegative(),
  quantity: z.number().int().min(1),
  image_url: z.string().url().optional().nullable(),
});

const CreateOrderSchema = z.object({
  items: z.array(OrderItemSchema).min(1),
  total_amount: z.number().positive(),
});

const UpdatePaymentSchema = z.object({
  payment_status: z.enum(["Pending", "Paid", "Failed"]),
});

export async function postOrder(req, res, next) {
  try {
    const parsed = CreateOrderSchema.parse(req.body);
    const order = await createOrder(parsed);
    res.status(201).json({ data: order });
  } catch (err) {
    next(err);
  }
}

export async function getOrders(req, res, next) {
  try {
    const orders = await listOrders();
    res.json({ data: orders });
  } catch (err) {
    next(err);
  }
}

export async function patchOrderPayment(req, res, next) {
  try {
    const id = req.params.id;
    if (!id) return res.status(400).json({ error: { message: "Missing id" } });

    const parsed = UpdatePaymentSchema.parse(req.body);
    const updated = await updateOrderPaymentStatus({ id, ...parsed });
    res.json({ data: updated });
  } catch (err) {
    next(err);
  }
}

