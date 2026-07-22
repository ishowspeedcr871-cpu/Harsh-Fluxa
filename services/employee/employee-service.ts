import { redirect } from "next/navigation";
import {
  ORGANIZATION_PERMISSIONS,
  requireActiveOrganization,
} from "@/services/authorization/guards";
import { prisma } from "@/database/client";

export async function requireEmployeeContext() {
  const context = await requireActiveOrganization();
  return context;
}

export async function requireQueueAccess() {
  const context = await requireActiveOrganization(ORGANIZATION_PERMISSIONS.QUEUE_READ);
  if (!context.membership) redirect("/dashboard");
  return context;
}

export async function getEmployeeProfile() {
  const { user, membership, organization } = await requireEmployeeContext();
  return { user, membership, organization };
}


