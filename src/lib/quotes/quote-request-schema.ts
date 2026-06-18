// src/lib/quotes/quote-request-schema.ts
import { z } from "zod";

export const quoteRequestItemSchema = z.object({
  productId: z.string().min(1),
  selected: z.boolean().default(false),
  quantity: z.coerce.number().int().min(1, "Quantity must be at least 1"),
});

export const quoteRequestSchema = z
  .object({
    name: z.string().trim().min(1, "Name is required"),
    email: z.string().trim().email("Enter a valid email address"),
    phone: z.string().trim().min(7, "Phone is required"),
    businessName: z.string().trim().min(1, "Business name is required"),
    message: z
      .string()
      .trim()
      .optional()
      .transform((value) => (value ? value : null)),
    items: z.array(quoteRequestItemSchema),
  })
  .refine((value) => value.items.some((item) => item.selected), {
    message: "Select at least one product",
    path: ["items"],
  });

export type QuoteRequestValues = z.input<typeof quoteRequestSchema>;
export type QuoteRequestParsedValues = z.output<typeof quoteRequestSchema>;
