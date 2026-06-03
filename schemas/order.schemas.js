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

/** Dine-in table: positive integer string only (e.g. "5", not "5a"). */
export const IntegerTableNumberSchema = z
  .string()
  .trim()
  .min(1)
  .max(12)
  .refine((val) => /^\d+$/.test(val), {
    message:
      "Table number must be a whole number (digits only, no letters).",
  })
  .refine((val) => {
    const n = Number(val);
    return Number.isSafeInteger(n) && n >= 1;
  }, { message: "Table number must be at least 1." });

export const CreateOrderSchema = z
  .object({
    items: z.array(OrderItemSchema).min(1),
    total_amount: z.number().positive(),
    payment_method: PaymentMethodSchema,
    payment_status: PaymentStatusSchema.optional(),
    table_number: IntegerTableNumberSchema.optional(),
    service_type: ServiceTypeSchema.optional().default("dine_in"),
    /** Per-phone/browser id so order history stays private on shared tables. */
    device_id: z.string().min(8).max(64).optional(),
  })
  .superRefine((data, ctx) => {
    if (data.service_type !== "takeout" && data.table_number === undefined) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: "table_number is required for dine-in orders",
        path: ["table_number"],
      });
    }
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

export const OrderHistorySchema = z.object({
  ids: z.array(z.string().min(1)).max(50),
  device_id: z.string().min(8).max(64),
});
