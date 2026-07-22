"use server";

import { prisma } from "@/database/client";
import { getEmployeeProfile } from "@/services/employee/employee-service";
import { revalidatePath } from "next/cache";

export async function updateWhatsappNumber(number: string) {
  const { organization } = await getEmployeeProfile();

  if (!organization || !organization.id) {
    throw new Error("Organization not found.");
  }

  await prisma.organizationSettings.upsert({
    where: { organizationId: organization.id },
    update: { supportPhone: number },
    create: { organizationId: organization.id, supportPhone: number },
  });

  revalidatePath("/customer");
  revalidatePath("/employee/settings/whatsapp");

  return { success: true };
}
