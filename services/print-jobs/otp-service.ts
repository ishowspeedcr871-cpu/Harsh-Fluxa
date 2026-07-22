"use server";

import { redirect, unstable_rethrow } from "next/navigation";
import { prisma } from "@/database/client";
import { createAuditLog } from "@/services/audit/log";
import {
  ORGANIZATION_PERMISSIONS,
  requireOrganizationPermission,
} from "@/services/authorization/guards";
import { createNotification } from "@/services/notifications/notification-service";
import { requireCustomerContext } from "@/services/customer/customer-service";
import { sendCommandToPrinter } from "@/services/printers/printer-service";
import {
  OTP_DIGITS,
  OTP_TTL_MINUTES,
  compareOtp,
  generateOtpCode,
  hashOtp,
  normalizeOtp,
} from "./otp-utils";

async function expireStaleOtps(printJobId: string) {
  await prisma.printJobOtp.updateMany({
    where: { printJobId, status: "ACTIVE", expiresAt: { lte: new Date() } },
    data: { status: "EXPIRED" },
  });
}

export async function generateCollectionOtp(printJobId: string) {
  const { session, organization } = await requireOrganizationPermission(
    ORGANIZATION_PERMISSIONS.QUEUE_MANAGE,
  );
  const current = await prisma.printJob.findFirst({
    where: { id: printJobId, organizationId: organization.id },
  });
  if (!current) throw new Error("Print job not found.");

  const code = generateOtpCode();
  const expiresAt = new Date(Date.now() + OTP_TTL_MINUTES * 60 * 1000);

  const job = await prisma.$transaction(async (tx) => {
    await tx.printJobOtp.updateMany({
      where: { printJobId: current.id, status: "ACTIVE" },
      data: { status: "REVOKED", revokedAt: new Date() },
    });
    await tx.printJobOtp.create({
      data: {
        printJobId: current.id,
        codeHash: hashOtp(code),
        generatedByUserId: session.userId,
        expiresAt,
      },
    });
    return tx.printJob.update({
      where: { id: current.id },
      data: {
        status: "OTP_GENERATED",
        readyAt: current.readyAt ?? new Date(),
        otpCodeHash: hashOtp(code),
        otpGeneratedAt: new Date(),
        events: {
          create: {
            actorUserId: session.userId,
            fromStatus: current.status,
            toStatus: "OTP_GENERATED",
            note: `Collection OTP generated. Expires at ${expiresAt.toLocaleString()}.`,
          },
        },
        activities: {
          create: {
            organizationId: organization.id,
            userId: current.customerUserId,
            action: "print_job.otp_generated",
            description: "A secure collection OTP was generated for this print job.",
          },
        },
        notifications: {
          create: {
            organizationId: organization.id,
            userId: current.customerUserId,
            title: "Your print job is ready for collection",
            message: `Use collection OTP ${code}. It expires at ${expiresAt.toLocaleString()}.`,
          },
        },
      },
    });
  });

  await createAuditLog({
    organizationId: organization.id,
    actorUserId: session.userId,
    action: "print_job.otp_generated",
    entityType: "PrintJob",
    entityId: job.id,
    metadata: { expiresAt: expiresAt.toISOString() },
  });
  await createNotification({
    organizationId: organization.id,
    userId: current.customerUserId,
    type: "OTP_GENERATED",
    title: "Collection OTP generated",
    message: "Your print job is ready for collection. Check your job notification for the OTP.",
    entityType: "PrintJob",
    entityId: job.id,
    metadata: { expiresAt: expiresAt.toISOString() },
  });

  return { job, code, expiresAt };
}

export async function verifyCollectionOtp(printJobId: string, code: string) {
  const { session, organization } = await requireOrganizationPermission(
    ORGANIZATION_PERMISSIONS.QUEUE_MANAGE,
  );
  const current = await prisma.printJob.findFirst({
    where: { id: printJobId, organizationId: organization.id },
    include: { otpHistory: { orderBy: { createdAt: "desc" } } },
  });
  if (!current) throw new Error("Print job not found.");
  await expireStaleOtps(current.id);

  const activeOtp = current.otpHistory.find(
    (otp) => otp.status === "ACTIVE" && otp.expiresAt > new Date(),
  );

  if (!activeOtp) throw new Error("Invalid or expired collection OTP.");

  // Rate limiting / Brute force protection
  if (activeOtp.attempts >= activeOtp.maxAttempts) {
    await prisma.printJobOtp.update({
      where: { id: activeOtp.id },
      data: { status: "LOCKED" }
    });
    throw new Error("Too many failed attempts. This OTP has been locked for security.");
  }

  if (!compareOtp(code, activeOtp.codeHash)) {
    await prisma.printJobOtp.update({
      where: { id: activeOtp.id },
      data: { attempts: { increment: 1 } }
    });
    
    await createAuditLog({
      organizationId: organization.id,
      actorUserId: session.userId,
      action: "print_job.otp_verification_failed",
      entityType: "PrintJob",
      entityId: current.id,
      severity: "WARNING",
      metadata: { attempts: activeOtp.attempts + 1 }
    });
    throw new Error("Invalid or expired collection OTP.");
  }

  const now = new Date();
  const job = await prisma.$transaction(async (tx) => {
    // 1. Mark OTP as verified
    await tx.printJobOtp.update({
      where: { id: activeOtp.id },
      data: { status: "VERIFIED", verifiedByUserId: session.userId, verifiedAt: now },
    });

    // 2. Mark job as OTP_VERIFIED
    // This allows the real printer connector to pick it up if it's connected
    return tx.printJob.update({
      where: { id: current.id },
      data: {
        status: "OTP_VERIFIED",
        collectedAt: now,
        otpCodeHash: null,
        events: {
          create: [
            {
              actorUserId: session.userId,
              fromStatus: current.status,
              toStatus: "OTP_VERIFIED",
              note: "Customer collection OTP verified. Job ready for physical release.",
            }
          ],
        },
        activities: {
          create: {
            organizationId: organization.id,
            userId: current.customerUserId,
            action: "print_job.otp_verified",
            description: "Collection OTP verified. Document is now releasing to the physical printer.",
          },
        },
      },
    });
  });

  await createAuditLog({
    organizationId: organization.id,
    actorUserId: session.userId,
    action: "print_job.collected",
    entityType: "PrintJob",
    entityId: job.id,
    metadata: { otpId: activeOtp.id },
  });
  await createNotification({
    organizationId: organization.id,
    userId: current.customerUserId,
    type: "JOB_COLLECTED",
    title: "Print job collected",
    message: "Your print job has been collected and completed.",
    entityType: "PrintJob",
    entityId: job.id,
    metadata: { otpId: activeOtp.id },
  });

  return job;
}

export async function globalVerifyOtpAction(formData: FormData) {
  const rawCode = String(formData.get("otp") ?? "");
  const code = normalizeOtp(rawCode);

  if (code.length !== OTP_DIGITS) {
    redirect("/organization?error=invalid_otp_format");
  }

  let redirectUrl: string;
  try {
    // 1. Find the active OTP record by looking up the hash (tenant isolated)
    const { organization } = await requireOrganizationPermission(ORGANIZATION_PERMISSIONS.QUEUE_MANAGE);

    const jobOtp = await prisma.printJobOtp.findFirst({
      where: {
        codeHash: hashOtp(code),
        status: "ACTIVE",
        expiresAt: { gt: new Date() },
        printJob: {
          organizationId: organization.id
        }
      },
      orderBy: { createdAt: "asc" },
    });

    if (!jobOtp) {
      console.error(`[OTP_VERIFY_FAILURE] No active OTP found with matching hash in org: ${organization.id}`);
      redirectUrl = "/organization?error=otp_not_found";
    } else {
      // 2. Delegate to the core verification logic which handles rate limiting and secure comparison
      await verifyCollectionOtp(jobOtp.printJobId, code);
      redirectUrl = `/organization?success=verified&jobId=${jobOtp.printJobId}`;
    }
  } catch (err: any) {
    unstable_rethrow(err);
    console.error("[OTP_ACTION_ERROR]", err);
    redirectUrl = `/organization?error=${err.message.includes("locked") ? "locked" : "invalid_otp"}`;
  }

  redirect(redirectUrl);
}

export async function generateCollectionOtpAction(formData: FormData) {
  const jobId = String(formData.get("jobId") ?? "");
  if (!jobId) redirect("/employee/queue?error=invalid_job");
  await generateCollectionOtp(jobId);
  redirect(`/employee/queue/${jobId}?otp=generated`);
}

export async function generateCustomerReleaseOtp(printJobId: string) {
  const { session, organization } = await requireCustomerContext();
  const current = await prisma.printJob.findFirst({
    where: { id: printJobId, organizationId: organization.id, customerUserId: session.userId },
  });
  if (!current) throw new Error("Print job not found.");

  const code = generateOtpCode();
  const expiresAt = new Date(Date.now() + OTP_TTL_MINUTES * 60 * 1000);

  const job = await prisma.$transaction(async (tx) => {
    await tx.printJobOtp.updateMany({
      where: { printJobId: current.id, status: "ACTIVE" },
      data: { status: "REVOKED", revokedAt: new Date() },
    });
    await tx.printJobOtp.create({
      data: {
        printJobId: current.id,
        codeHash: hashOtp(code),
        generatedByUserId: session.userId,
        expiresAt,
      },
    });
    return tx.printJob.update({
      where: { id: current.id },
      data: {
        status: "OTP_GENERATED",
        otpCodeHash: hashOtp(code),
        otpGeneratedAt: new Date(),
        events: {
          create: {
            actorUserId: session.userId,
            fromStatus: current.status,
            toStatus: "OTP_GENERATED",
            note: `Secure release OTP generated by customer. Expires at ${expiresAt.toLocaleString()}.`,
          },
        },
        activities: {
          create: {
            organizationId: organization.id,
            userId: session.userId,
            action: "print_job.otp_generated",
            description: `Generated secure print release OTP: ${code}`,
          },
        },
        notifications: {
          create: {
            organizationId: organization.id,
            userId: session.userId,
            title: "Your print release OTP is ready",
            message: `Use collection OTP ${code}. It expires at ${expiresAt.toLocaleString()}.`,
          },
        },
      },
    });
  });

  return { job, code, expiresAt };
}

export async function generateCustomerReleaseOtpAction(formData: FormData) {
  const jobId = String(formData.get("jobId") ?? "");
  if (!jobId) redirect("/customer?error=invalid_job");
  
  try {
    await generateCustomerReleaseOtp(jobId);
    // Success redirect WITHOUT the code in URL to prevent leakage via browser history/referrers
    redirect(`/customer/jobs/${jobId}?otp_generated=true`);
  } catch (err) {
    unstable_rethrow(err);
    redirect(`/customer/jobs/${jobId}?error=otp_failed`);
  }
}

export async function verifyCollectionOtpAction(formData: FormData) {
  const jobId = String(formData.get("jobId") ?? "");
  const code = normalizeOtp(String(formData.get("otp") ?? ""));
  
  if (!jobId || code.length !== OTP_DIGITS) {
    redirect(`/employee/queue/${jobId}/verify?error=invalid_otp`);
  }

  let redirectUrl: string;
  try {
    await verifyCollectionOtp(jobId, code);
    redirectUrl = `/employee/queue/${jobId}?collection=complete`;
  } catch (err) {
    unstable_rethrow(err);
    redirectUrl = `/employee/queue/${jobId}/verify?error=invalid_otp`;
  }
  redirect(redirectUrl);
}
