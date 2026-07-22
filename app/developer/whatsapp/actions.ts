"use server";

import { prisma } from "@/database/client";
import { revalidatePath } from "next/cache";

export async function updateGlobalWhatsappNumber(number: string) {
  await prisma.platformSettings.upsert({
    where: { key: "whatsapp_number" },
    update: { value: number },
    create: { key: "whatsapp_number", value: number }
  });

  revalidatePath("/developer/whatsapp");
  return { success: true };
}
