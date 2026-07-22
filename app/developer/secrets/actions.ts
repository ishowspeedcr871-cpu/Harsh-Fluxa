"use server";

import { prisma } from "@/database/client";
import { revalidatePath } from "next/cache";

export async function upsertSecret(key: string, value: string) {
  await prisma.platformSettings.upsert({
    where: { key },
    update: { value },
    create: { key, value }
  });

  revalidatePath("/developer/secrets");
  return { success: true };
}

export async function deleteSecret(key: string) {
  await prisma.platformSettings.delete({
    where: { key }
  });

  revalidatePath("/developer/secrets");
  return { success: true };
}
