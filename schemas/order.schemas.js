import { z } from "zod";

export const OrderItemSchema = z.object({
  product_id: z.union([z.string().uuid(), z.string(), z.number()]),
  name: z.string().min(1),
  price: z.number().nonnegative(),
  quantity: z.number().int().min(1),
  image_url: z.union([z.string().url(), z.null()]).optional(),
});

export const CreateOrderSchema = z.object({
  items: z.array(OrderItemSchema).min(1),
  total_amount: z.number().positive(),
});

export const UpdatePaymentSchema = z.object({
  payment_status: z.enum(["Pending", "Paid", "Failed"]),
});
