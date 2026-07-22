import { createHash, randomBytes } from "node:crypto";
import { prisma } from "@/database/client";
import type { InviteMemberInput } from "@/features/organizations/member-schemas";
import {
  ORGANIZATION_PERMISSIONS,
  requireOrganizationPermission,
} from "@/services/authorization/guards";
import { createAuditLog } from "@/services/audit/log";
import { getCurrentSession } from "@/services/auth/session";
import { createNotification } from "@/services/notifications/notification-service";

function hashInviteToken(token: string) {
  return createHash("sha256").update(token).digest("hex");
}

function createInviteToken() {
  return randomBytes(32).toString("base64url");
}

export async function listOrganizationInvitations() {
  const { organization } = await requireOrganizationPermission(
    ORGANIZATION_PERMISSIONS.INVITATIONS_READ,
  );
  await expireStaleInvitations(organization.id);
  return prisma.membershipInvitation.findMany({
    where: { organizationId: organization.id },
    include: { role: true, invitedByUser: true, acceptedByUser: true },
    orderBy: { createdAt: "desc" },
  });
}

async function expireStaleInvitations(organizationId: string) {
  await prisma.membershipInvitation.updateMany({
    where: { organizationId, status: "PENDING", expiresAt: { lt: new Date() } },
    data: { status: "EXPIRED" },
  });
}

export async function inviteOrganizationMember(input: InviteMemberInput) {
  const { session, organization } = await requireOrganizationPermission(
    ORGANIZATION_PERMISSIONS.INVITATIONS_WRITE,
  );
  const token = createInviteToken();
  const expiresAt = new Date(Date.now() + input.expiresInDays * 24 * 60 * 60 * 1000);
  const invitation = await prisma.membershipInvitation.create({
    data: {
      organizationId: organization.id,
      email: input.email,
      roleId: input.roleId,
      tokenHash: hashInviteToken(token),
      invitedByUserId: session.userId,
      expiresAt,
    },
  });
  await createAuditLog({
    organizationId: organization.id,
    actorUserId: session.userId,
    action: "invitation.created",
    entityType: "MembershipInvitation",
    entityId: invitation.id,
    metadata: { email: input.email, roleId: input.roleId },
  });
  await createNotification({
    organizationId: organization.id,
    audience: "ORGANIZATION",
    type: "INVITATION_EVENT",
    title: "Invitation created",
    message: `${input.email} was invited to ${organization.name}.`,
    entityType: "MembershipInvitation",
    entityId: invitation.id,
  });
  return { invitation, token };
}

export async function resendOrganizationInvitation(invitationId: string) {
  const { session, organization } = await requireOrganizationPermission(
    ORGANIZATION_PERMISSIONS.INVITATIONS_WRITE,
  );
  const token = createInviteToken();
  const invitation = await prisma.membershipInvitation.update({
    where: { id: invitationId, organizationId: organization.id },
    data: {
      tokenHash: hashInviteToken(token),
      status: "PENDING",
      expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
      revokedAt: null,
    },
  });
  await createAuditLog({
    organizationId: organization.id,
    actorUserId: session.userId,
    action: "invitation.resent",
    entityType: "MembershipInvitation",
    entityId: invitation.id,
  });
  return { invitation, token };
}

export async function revokeOrganizationInvitation(invitationId: string) {
  const { session, organization } = await requireOrganizationPermission(
    ORGANIZATION_PERMISSIONS.INVITATIONS_WRITE,
  );
  const invitation = await prisma.membershipInvitation.update({
    where: { id: invitationId, organizationId: organization.id },
    data: { status: "REVOKED", revokedAt: new Date() },
  });
  await createAuditLog({
    organizationId: organization.id,
    actorUserId: session.userId,
    action: "invitation.revoked",
    entityType: "MembershipInvitation",
    entityId: invitation.id,
  });
  await createNotification({
    organizationId: organization.id,
    audience: "ORGANIZATION",
    type: "INVITATION_EVENT",
    title: "Invitation revoked",
    message: `${invitation.email} invitation was revoked.`,
    entityType: "MembershipInvitation",
    entityId: invitation.id,
  });
  return invitation;
}

export async function getInvitationByToken(token: string) {
  const invitation = await prisma.membershipInvitation.findUnique({
    where: { tokenHash: hashInviteToken(token) },
    include: { organization: true, role: true },
  });
  if (!invitation) return null;
  if (invitation.status === "PENDING" && invitation.expiresAt < new Date()) {
    return prisma.membershipInvitation.update({
      where: { id: invitation.id },
      data: { status: "EXPIRED" },
      include: { organization: true, role: true },
    });
  }
  return invitation;
}

export async function acceptOrganizationInvitation(token: string) {
  const session = await getCurrentSession();
  if (!session) throw new Error("Authentication is required.");
  const invitation = await getInvitationByToken(token);
  if (!invitation || invitation.status !== "PENDING" || invitation.expiresAt < new Date())
    throw new Error("Invitation is not available.");
  if (session.user.email.toLowerCase() !== invitation.email.toLowerCase())
    throw new Error("Invitation email does not match this account.");
  const membership = await prisma.$transaction(async (tx) => {
    const item = await tx.membership.upsert({
      where: {
        organizationId_userId: {
          organizationId: invitation.organizationId,
          userId: session.userId,
        },
      },
      update: { roleId: invitation.roleId, status: "ACTIVE", deletedAt: null },
      create: {
        organizationId: invitation.organizationId,
        userId: session.userId,
        roleId: invitation.roleId,
        status: "ACTIVE",
      },
    });
    await tx.membershipInvitation.update({
      where: { id: invitation.id },
      data: { status: "ACCEPTED", acceptedByUserId: session.userId, acceptedAt: new Date() },
    });
    return item;
  });
  await createAuditLog({
    organizationId: invitation.organizationId,
    actorUserId: session.userId,
    action: "invitation.accepted",
    entityType: "MembershipInvitation",
    entityId: invitation.id,
  });
  return membership;
}
