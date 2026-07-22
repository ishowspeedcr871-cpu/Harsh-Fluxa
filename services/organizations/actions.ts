"use server";

import { redirect } from "next/navigation";
import {
  createRoleSchema,
  inviteMemberSchema,
  updateMembershipSchema,
  updateRoleSchema,
} from "@/features/organizations/member-schemas";
import {
  organizationCreateSchema,
  organizationSettingsSchema,
  organizationSwitchSchema,
  organizationUpdateSchema,
} from "@/features/organizations/schemas";
import { createAuditLog } from "@/services/audit/log";
import { getCurrentSession } from "@/services/auth/session";
import { setActiveOrganizationId } from "@/services/organizations/context";
import {
  acceptOrganizationInvitation,
  inviteOrganizationMember,
  resendOrganizationInvitation,
  revokeOrganizationInvitation,
} from "@/services/organizations/invitations";
import {
  restoreOrganizationMembership,
  updateOrganizationMembership,
} from "@/services/organizations/members";
import {
  archiveOrganization,
  createOrganizationForCurrentUser,
  requireOrganizationAccess,
  updateOrganization,
  updateOrganizationSettings,
} from "@/services/organizations/organization-service";
import { createOrganizationRole, updateOrganizationRole } from "@/services/organizations/roles";

function optionalString(value: FormDataEntryValue | null) {
  return typeof value === "string" && value.trim() ? value : undefined;
}

export async function onboardOrganizationAction(formData: FormData) {
  const parsed = organizationCreateSchema.safeParse({
    name: formData.get("name"),
    slug: formData.get("slug"),
    timezone: optionalString(formData.get("timezone")) ?? "UTC",
    currency: optionalString(formData.get("currency")) ?? "USD",
  });

  if (!parsed.success) redirect("/onboarding/organization?error=invalid_input");

  await createOrganizationForCurrentUser(parsed.data);
  redirect("/organization");
}

export async function createOrganizationAction(formData: FormData) {
  const parsed = organizationCreateSchema.safeParse({
    name: formData.get("name"),
    slug: formData.get("slug"),
    timezone: optionalString(formData.get("timezone")) ?? "UTC",
    currency: optionalString(formData.get("currency")) ?? "USD",
  });

  if (!parsed.success) redirect("/organization/settings?error=invalid_input");

  await createOrganizationForCurrentUser(parsed.data);
  redirect("/organization");
}

export async function updateOrganizationAction(formData: FormData) {
  const parsed = organizationUpdateSchema.safeParse({
    organizationId: formData.get("organizationId"),
    name: optionalString(formData.get("name")),
    slug: optionalString(formData.get("slug")),
    timezone: optionalString(formData.get("timezone")),
    currency: optionalString(formData.get("currency")),
  });

  if (!parsed.success) redirect("/organization/settings?error=invalid_organization");

  await updateOrganization(parsed.data);
  redirect("/organization/settings?updated=organization");
}

export async function updateOrganizationSettingsAction(formData: FormData) {
  const parsed = organizationSettingsSchema.safeParse({
    organizationId: formData.get("organizationId"),
    displayName: formData.get("displayName"),
    supportEmail: formData.get("supportEmail"),
    supportPhone: formData.get("supportPhone"),
  });

  if (!parsed.success) redirect("/organization/settings?error=invalid_settings");

  await updateOrganizationSettings(parsed.data);
  redirect("/organization/settings?updated=settings");
}

export async function archiveOrganizationAction(formData: FormData) {
  const organizationId = formData.get("organizationId");

  if (typeof organizationId !== "string" || !organizationId) {
    redirect("/organization/settings?error=invalid_organization");
  }

  await archiveOrganization(organizationId);
  redirect("/dashboard");
}

export async function switchOrganizationAction(formData: FormData) {
  const parsed = organizationSwitchSchema.safeParse({
    organizationId: formData.get("organizationId"),
  });

  if (!parsed.success) redirect("/organization?error=invalid_organization");

  const { session } = await requireOrganizationAccess(parsed.data.organizationId);
  await setActiveOrganizationId(parsed.data.organizationId);
  await createAuditLog({
    organizationId: parsed.data.organizationId,
    actorUserId: session.userId,
    action: "organization.switched",
    entityType: "Organization",
    entityId: parsed.data.organizationId,
  });

  redirect("/organization");
}

export async function requireOrganizationOrRedirect() {
  const sessionData = await getCurrentSession();
  if (!sessionData) redirect("/login");
  if (sessionData.user.memberships.length === 0) redirect("/onboarding/organization");
  return { session: sessionData.session, user: sessionData.user };
}

export async function inviteMemberAction(formData: FormData) {
  const parsed = inviteMemberSchema.safeParse({
    email: formData.get("email"),
    roleId: formData.get("roleId"),
    expiresInDays: formData.get("expiresInDays") ?? 7,
  });
  if (!parsed.success) redirect("/organization/invitations?error=invalid_invitation");
  await inviteOrganizationMember(parsed.data);
  redirect("/organization/invitations?created=1");
}

export async function resendInvitationAction(formData: FormData) {
  const invitationId = formData.get("invitationId");
  if (typeof invitationId !== "string")
    redirect("/organization/invitations?error=invalid_invitation");
  await resendOrganizationInvitation(invitationId);
  redirect("/organization/invitations?resent=1");
}

export async function revokeInvitationAction(formData: FormData) {
  const invitationId = formData.get("invitationId");
  if (typeof invitationId !== "string")
    redirect("/organization/invitations?error=invalid_invitation");
  await revokeOrganizationInvitation(invitationId);
  redirect("/organization/invitations?revoked=1");
}

export async function acceptInvitationAction(formData: FormData) {
  const token = formData.get("token");
  if (typeof token !== "string") redirect("/organization?error=invalid_invitation");
  await acceptOrganizationInvitation(token);
  redirect("/organization?accepted_invitation=1");
}

export async function updateMembershipAction(formData: FormData) {
  const parsed = updateMembershipSchema.safeParse({
    membershipId: formData.get("membershipId"),
    roleId: formData.get("roleId"),
    status: formData.get("status"),
  });
  if (!parsed.success) redirect("/organization/members?error=invalid_membership");
  await updateOrganizationMembership(parsed.data);
  redirect(`/organization/members/${parsed.data.membershipId}?updated=1`);
}

export async function restoreMembershipAction(formData: FormData) {
  const membershipId = formData.get("membershipId");
  if (typeof membershipId !== "string") redirect("/organization/members?error=invalid_membership");
  await restoreOrganizationMembership(membershipId);
  redirect(`/organization/members/${membershipId}?restored=1`);
}

export async function createRoleAction(formData: FormData) {
  const parsed = createRoleSchema.safeParse({
    name: formData.get("name"),
    key: formData.get("key"),
    description: formData.get("description"),
    permissions: formData.getAll("permissions"),
  });
  if (!parsed.success) redirect("/organization/roles?error=invalid_role");
  await createOrganizationRole(parsed.data);
  redirect("/organization/roles?created=1");
}

export async function updateRoleAction(formData: FormData) {
  const parsed = updateRoleSchema.safeParse({
    roleId: formData.get("roleId"),
    name: formData.get("name"),
    key: formData.get("key"),
    description: formData.get("description"),
    permissions: formData.getAll("permissions"),
  });
  if (!parsed.success) redirect("/organization/roles?error=invalid_role");
  await updateOrganizationRole(parsed.data);
  redirect("/organization/roles?updated=1");
}
