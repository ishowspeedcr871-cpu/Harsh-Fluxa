import type { OrganizationStatus } from "@prisma/client";
import { prisma } from "@/database/client";
import type {
  OrganizationCreateInput,
  OrganizationSettingsInput,
  OrganizationUpdateInput,
} from "@/features/organizations/schemas";
import { createAuditLog } from "@/services/audit/log";
import { ensureOrganizationOwnerPermissions } from "@/services/organizations/roles";
import { getCurrentSession } from "@/services/auth/session";
import {
  getSelectedOrganizationId,
  setActiveOrganizationId,
} from "@/services/organizations/context";
import { createNotification } from "@/services/notifications/notification-service";

const OWNER_ROLE_KEY = "organization-owner";

async function getOrCreateOrganizationOwnerRole() {
  return prisma.role.upsert({
    where: { key: OWNER_ROLE_KEY },
    update: {},
    create: {
      key: OWNER_ROLE_KEY,
      name: "Organization Owner",
      description: "Default owner role for organization onboarding.",
      scope: "ORGANIZATION",
      isSystem: true,
    },
  });
}

export async function listCurrentUserOrganizations() {
  const sessionData = await getCurrentSession();
  if (!sessionData) return [];

  return sessionData.user.memberships.map((membership) => ({
    membershipId: membership.id,
    role: membership.role,
    organization: membership.organization,
  }));
}

export async function getActiveOrganizationMembership() {
  const sessionData = await getCurrentSession();
  if (!sessionData) return null;

  const selectedOrganizationId = await getSelectedOrganizationId();
  const membership = selectedOrganizationId
    ? (sessionData.user.memberships.find(
        (m) => m.organizationId === selectedOrganizationId,
      ) ?? null)
    : null;

  return membership ?? sessionData.user.memberships[0] ?? null;
}

export async function requireOrganizationAccess(organizationId: string) {
  const sessionData = await getCurrentSession();
  if (!sessionData) throw new Error("Authentication is required.");

  const membership = sessionData.user.memberships.find(
    (item) => item.organizationId === organizationId,
  );
  const platformMembership = sessionData.user.memberships.find(
    (item) => item.role.scope === "PLATFORM",
  );

  if (!membership && !platformMembership) {
    throw new Error("Organization access denied.");
  }

  return { 
    session: sessionData.session, 
    user: sessionData.user,
    membership, 
    isPlatformContext: Boolean(platformMembership && !membership) 
  };
}

export async function createOrganizationForCurrentUser(input: OrganizationCreateInput) {
  const sessionData = await getCurrentSession();
  if (!sessionData) throw new Error("Authentication is required.");

  const ownerRole = await getOrCreateOrganizationOwnerRole();
  await ensureOrganizationOwnerPermissions(ownerRole.id);

  const organization = await prisma.organization.create({
    data: {
      name: input.name,
      slug: input.slug,
      timezone: input.timezone,
      currency: input.currency,
      settings: { create: { displayName: input.name } },
      memberships: {
        create: {
          userId: sessionData.session.userId,
          roleId: ownerRole.id,
          status: "ACTIVE",
        },
      },
    },
  });

  await setActiveOrganizationId(organization.id);
  await createAuditLog({
    organizationId: organization.id,
    actorUserId: sessionData.session.userId,
    action: "organization.created",
    entityType: "Organization",
    entityId: organization.id,
  });
  await createNotification({
    organizationId: organization.id,
    audience: "ORGANIZATION",
    type: "ORGANIZATION_EVENT",
    title: "Organization created",
    message: `${organization.name} is ready for tenant operations.`,
    entityType: "Organization",
    entityId: organization.id,
  });

  return organization;
}

export async function updateOrganization(input: OrganizationUpdateInput) {
  const { session } = await requireOrganizationAccess(input.organizationId);

  const organization = await prisma.organization.update({
    where: { id: input.organizationId },
    data: {
      name: input.name,
      slug: input.slug,
      timezone: input.timezone,
      currency: input.currency,
    },
  });

  await createAuditLog({
    organizationId: organization.id,
    actorUserId: session.userId,
    action: "organization.updated",
    entityType: "Organization",
    entityId: organization.id,
  });

  return organization;
}

export async function archiveOrganization(organizationId: string) {
  const { session } = await requireOrganizationAccess(organizationId);

  const organization = await prisma.organization.update({
    where: { id: organizationId },
    data: { status: "ARCHIVED", deletedAt: new Date() },
  });

  await createAuditLog({
    organizationId,
    actorUserId: session.userId,
    action: "organization.archived",
    entityType: "Organization",
    entityId: organizationId,
  });

  return organization;
}

export async function updateOrganizationStatus(organizationId: string, status: OrganizationStatus) {
  const { session } = await requireOrganizationAccess(organizationId);

  const organization = await prisma.organization.update({
    where: { id: organizationId },
    data: { status },
  });

  await createAuditLog({
    organizationId,
    actorUserId: session.userId,
    action: "organization.status_updated",
    entityType: "Organization",
    entityId: organizationId,
    metadata: { status },
  });

  return organization;
}

export async function updateOrganizationSettings(input: OrganizationSettingsInput) {
  const { session } = await requireOrganizationAccess(input.organizationId);

  const settings = await prisma.organizationSettings.upsert({
    where: { organizationId: input.organizationId },
    update: {
      displayName: input.displayName || null,
      supportEmail: input.supportEmail || null,
      supportPhone: input.supportPhone || null,
    },
    create: {
      organizationId: input.organizationId,
      displayName: input.displayName || null,
      supportEmail: input.supportEmail || null,
      supportPhone: input.supportPhone || null,
    },
  });

  await createAuditLog({
    organizationId: input.organizationId,
    actorUserId: session.userId,
    action: "organization.settings_updated",
    entityType: "OrganizationSettings",
    entityId: settings.id,
  });

  return settings;
}

export async function getOrganizationDetails(organizationId: string) {
  await requireOrganizationAccess(organizationId);

  return prisma.organization.findUnique({
    where: { id: organizationId },
    include: { settings: true, memberships: { include: { user: true, role: true } } },
  });
}

export async function listOrganizations() {
  return prisma.organization.findMany({
    where: { status: "ACTIVE", deletedAt: null },
    select: { id: true, name: true, slug: true },
  });
}
