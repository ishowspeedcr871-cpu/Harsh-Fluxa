import { prisma } from "@/database/client";
import { requireCustomerContext } from "@/services/customer/customer-service";

export async function listCustomerNotifications() {
  const { session, organization } = await requireCustomerContext();
  return prisma.customerNotification.findMany({
    where: { organizationId: organization.id, userId: session.userId },
    include: { printJob: true },
    orderBy: { createdAt: "desc" },
    take: 50,
  });
}

export async function listCustomerActivity() {
  const { session, organization } = await requireCustomerContext();
  return prisma.customerActivity.findMany({
    where: { organizationId: organization.id, userId: session.userId },
    include: { printJob: true },
    orderBy: { createdAt: "desc" },
    take: 50,
  });
}
