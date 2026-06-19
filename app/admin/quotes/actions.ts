// app/admin/quotes/actions.ts
"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";
import { requireAdmin } from "@/src/lib/auth/admin";
import { prisma } from "@/src/lib/prisma";

const quoteStatusSchema = z.enum([
  "NEW",
  "CONTACTED",
  "NEGOTIATING",
  "CLOSED",
  "LOST",
]);

export async function updateQuoteStatusAction(formData: FormData) {
  await requireAdmin();

  const parsed = z
    .object({
      id: z.string().min(1),
      status: quoteStatusSchema,
    })
    .parse({
      id: formData.get("id"),
      status: formData.get("status"),
    });

  await prisma.quote.update({
    where: { id: parsed.id },
    data: {
      status: parsed.status,
    },
  });

  revalidatePath("/admin/quotes");
}
