import { z } from "zod";

export const OrderItemSchema = z.object({
  product_id: z.union([z.string().uuid(), z.string(), z.number()]),
  name: z.string().min(1),
  price: z.number().nonnegative(),
  quantity: z.number().int().min(1),
  image_url: z.union([z.string().url(), z.null()]).optional(),
});

export const PaymentMethodSchema = z.enum(["cod", "gcash"]);

export const PaymentStatusSchema = z.enum(["Pending", "Paid", "Failed"]);

export const AdminPaymentStatusSchema = z.enum(["Pending", "Paid"]);

export const OrderStatusSchema = z.enum([
  "received",
  "preparing",
  "serving",
  "served",
  "completed",
  "cancelled",
]);

export const AdminKitchenStatusSchema = z.enum([
  "received",
  "preparing",
  "serving",
  "served",
  "completed",
]);

export const ServiceTypeSchema = z.enum(["dine_in", "takeout"]);

export const CreateOrderSchema = z
  .object({
    items: z.array(OrderItemSchema).min(1),
    total_amount: z.number().positive(),
    payment_method: PaymentMethodSchema,
    payment_status: PaymentStatusSchema.optional(),
    table_number: z.string().min(1).max(12).optional(),
    service_type: ServiceTypeSchema.optional().default("dine_in"),
  })
  .superRefine((data, ctx) => {
    if (data.payment_method === "cod") {
      const status = data.payment_status ?? "Pending";
      if (status !== "Pending") {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: "COD orders must have payment_status Pending",
          path: ["payment_status"],
        });
      }
      return;
    }
    if (data.payment_status !== "Paid" && data.payment_status !== "Failed") {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: "GCash orders require payment_status Paid or Failed",
        path: ["payment_status"],
      });
    }
  });

export const UpdatePaymentSchema = z.object({
  payment_status: AdminPaymentStatusSchema,
});

export const UpdateOrderStatusSchema = z.object({
  order_status: AdminKitchenStatusSchema,
});
