"use server";

import type { NotificationAudience, NotificationType, Prisma } from "@prisma/client";
import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { prisma } from "@/database/client";
import { notificationQuerySchema } from "@/features/notifications/schemas";
import type { NotificationQuery } from "@/features/notifications/schemas";
import { createAuditLog } from "@/services/audit/log";
import { getCurrentSession } from "@/services/auth/session";
import { getSelectedOrganizationId } from "@/services/organizations/context";

type CreateNotificationInput = {
  type: NotificationType;
  title: string;
  message: string;
  organizationId?: string | null;
  userId?: string | null;
  audience?: NotificationAudience;
  entityType?: string;
  entityId?: string;
  metadata?: Prisma.InputJsonValue;
};

export async function createNotification(input: CreateNotificationInput) {
  const notification = await prisma.notification.create({
    data: {
      type: input.type,
      title: input.title,
      message: input.message,
      organizationId: input.organizationId ?? null,
      userId: input.userId ?? null,
      audience:
        input.audience ??
        (input.userId ? "USER" : input.organizationId ? "ORGANIZATION" : "PLATFORM"),
      entityType: input.entityType,
      entityId: input.entityId,
      metadata: input.metadata,
    },
  });

  await createAuditLog({
    organizationId: input.organizationId ?? undefined,
    action: "notification.created",
    entityType: "Notification",
    entityId: notification.id,
    metadata: { type: input.type, audience: notification.audience },
  });

  return notification;
}

export async function getNotificationBadgeCount() {
  const session = await getCurrentSession();
  if (!session) return 0;
  const organizationId = await getSelectedOrganizationId();
  return prisma.notification.count({
    where: {
      status: "UNREAD",
      OR: [
        { userId: session.userId },
        ...(organizationId ? [{ organizationId, audience: "ORGANIZATION" as const }] : []),
        { audience: "PLATFORM" },
      ],
    },
  });
}

export async function listNotifications(input: NotificationQuery) {
  const session = await getCurrentSession();
  if (!session) redirect("/login");
  const query = notificationQuerySchema.parse(input);
  const organizationId = await getSelectedOrganizationId();
  const skip = (query.page - 1) * query.pageSize;
  const visibilityFilters = [
    { userId: session.userId },
    ...(organizationId ? [{ organizationId, audience: "ORGANIZATION" as const }] : []),
    { audience: "PLATFORM" as const },
  ];
  const searchFilters = query.q
    ? [
        { title: { contains: query.q, mode: "insensitive" as const } },
        { message: { contains: query.q, mode: "insensitive" as const } },
      ]
    : undefined;
  const where = {
    AND: [{ OR: visibilityFilters }, ...(searchFilters ? [{ OR: searchFilters }] : [])],
    ...(query.status === "all" ? {} : { status: query.status }),
    ...(query.type === "all" ? {} : { type: query.type as NotificationType }),
  };
  const [notifications, total, unread] = await prisma.$transaction([
    prisma.notification.findMany({
      where,
      orderBy: { createdAt: "desc" },
      skip,
      take: query.pageSize,
    }),
    prisma.notification.count({ where }),
    prisma.notification.count({ where: { ...where, status: "UNREAD" } }),
  ]);
  return {
    notifications,
    total,
    unread,
    page: query.page,
    pageSize: query.pageSize,
    pageCount: Math.max(1, Math.ceil(total / query.pageSize)),
  };
}

export async function markNotificationReadAction(formData: FormData) {
  const notificationId = String(formData.get("notificationId") ?? "");
  if (!notificationId) redirect("/customer/notifications?error=invalid_notification");
  const session = await getCurrentSession();
  if (!session) redirect("/login");
  const notification = await prisma.notification.update({
    where: { id: notificationId },
    data: { status: "READ", readAt: new Date() },
  });
  await createAuditLog({
    organizationId: notification.organizationId ?? undefined,
    actorUserId: session.userId,
    action: "notification.read",
    entityType: "Notification",
    entityId: notification.id,
  });
  redirect("/customer/notifications?updated=1");
}

export async function markAllNotificationsReadAction() {
  const session = await getCurrentSession();
  if (!session) redirect("/login");
  const organizationId = await getSelectedOrganizationId();
  await prisma.notification.updateMany({
    where: {
      status: "UNREAD",
      OR: [
        { userId: session.userId },
        ...(organizationId ? [{ organizationId, audience: "ORGANIZATION" as const }] : []),
        { audience: "PLATFORM" },
      ],
    },
    data: { status: "READ", readAt: new Date() },
  });
  await createAuditLog({
    organizationId: organizationId ?? undefined,
    actorUserId: session.userId,
    action: "notifications.read_all",
    entityType: "Notification",
  });
  redirect("/customer/notifications?updated=1");
}

export async function markAsRead(id: string) {
  const session = await getCurrentSession();
  if (!session) throw new Error("Unauthorized");
  
  await prisma.notification.update({
    where: { id },
    data: { status: "READ", readAt: new Date() }
  });
  
  // No redirect, just revalidate
  revalidatePath("/");
}

export async function markAllAsRead() {
  const session = await getCurrentSession();
  if (!session) throw new Error("Unauthorized");
  const organizationId = await getSelectedOrganizationId();
  
  await prisma.notification.updateMany({
    where: {
      status: "UNREAD",
      OR: [
        { userId: session.userId },
        ...(organizationId ? [{ organizationId, audience: "ORGANIZATION" as const }] : []),
        { audience: "PLATFORM" },
      ],
    },
    data: { status: "READ", readAt: new Date() }
  });
  
  revalidatePath("/");
}
