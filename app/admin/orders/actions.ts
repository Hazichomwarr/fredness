// app/admin/ores/actions.ts
"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";
import { prisma } from "@/src/lib/prisma";

const orderStatusSchema = z.enum([
  "PENDING",
  "PAID",
  "PROCESSING",
  "FULFILLED",
  "CANCELLED",
]);

export async function updateOrderStatusAction(formData: FormData) {
  const parsed = z
    .object({
      id: z.string().min(1),
      status: orderStatusSchema,
    })
    .parse({
      id: formData.get("id"),
      status: formData.get("status"),
    });

  await prisma.order.update({
    where: { id: parsed.id },
    data: {
      status: parsed.status,
    },
  });

  revalidatePath("/admin/orders");
}
