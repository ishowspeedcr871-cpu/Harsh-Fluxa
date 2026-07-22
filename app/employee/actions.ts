"use server";

import { unstable_rethrow } from "next/navigation";
import { listPrintQueue, releasePrintJobByOtp } from "@/services/print-queue/queue-service";
import { serializeData } from "@/lib/serialization";
import { prisma } from "@/database/client";
import { getEmployeeProfile } from "@/services/employee/employee-service";

export async function fetchLiveQueue() {
  const result = await listPrintQueue({
    page: 1,
    pageSize: 20,
    status: "all",
    priority: "all",
    assigned: "all",
    sort: "createdAt",
    direction: "desc"
  });
  return serializeData(result.jobs);
}

export async function submitOtpAction(otp: string) {
  try {
    const result = await releasePrintJobByOtp(otp);
    return { 
      success: true, 
      message: result.message,
      jobId: result.jobId 
    };
  } catch (err: any) {
    unstable_rethrow(err);
    return { success: false, error: err.message || "Failed to verify OTP" };
  }
}

export async function fetchLiveSettingsData() {
  try {
    const { organization, user, membership } = await getEmployeeProfile();

    // 1. Fetch registered printers for organization
    const printers = await prisma.printer.findMany({
      where: { organizationId: organization.id, deletedAt: null },
      orderBy: [{ status: "asc" }, { name: "asc" }],
      take: 3,
    });

    // 2. Fetch active print jobs in the organization for the pickup queue
    const awaitingJobs = await prisma.printJob.findMany({
      where: {
        organizationId: organization.id,
        status: { in: ["READY", "PRINTING", "QUEUED", "ASSIGNED"] }
      },
      include: {
        customerUser: true,
        files: true
      },
      orderBy: {
        createdAt: "desc"
      },
      take: 5
    });

    return {
      success: true,
      user: serializeData(user),
      membership: serializeData(membership),
      organization: serializeData(organization),
      printers: serializeData(printers),
      jobs: serializeData(awaitingJobs),
    };
  } catch (error: any) {
    unstable_rethrow(error);
    console.error("Error fetching live settings data:", error);
    return { success: false, error: error.message || "Failed to fetch live settings data" };
  }
}

