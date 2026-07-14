import { z } from "zod";

export const checkoutSchema = z.object({
  customerEmail: z
    .preprocess(
      (value) =>
        typeof value === "string" && value.trim() === "" ? null : value,
      z
        .string()
        .trim()
        .email("Enter a valid email address")
        .nullable()
        .optional(),
    )
    .transform((value) => value ?? null),
  customerName: z.string().trim().optional(),
  items: z
    .array(
      z.object({
        productId: z.string().min(1),
        variantId: z.string().min(1).optional().nullable(),
        quantity: z.coerce.number().int().min(1),
      }),
    )
    .min(1, "Cart is empty"),
});
