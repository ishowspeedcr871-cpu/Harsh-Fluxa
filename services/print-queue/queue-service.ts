import { prisma } from "@/database/client";
import { unstable_rethrow } from "next/navigation";
import type { QueueQuery } from "@/features/print-queue/schemas";
import { queueQuerySchema } from "@/features/print-queue/schemas";
import { requireQueueAccess } from "@/services/employee/employee-service";
import { hashOtp } from "@/services/print-jobs/otp-utils";
import { resolvePrinterForJob } from "@/services/printers/printer-resolution";

export async function getEmployeeDashboard() {
  const { session, organization } = await requireQueueAccess();
  const [queued, assignedToMe, printing, ready, urgent] = await prisma.$transaction([
    prisma.printJob.count({ where: { organizationId: organization.id, status: "QUEUED" } }),
    prisma.printJob.count({
      where: {
        organizationId: organization.id,
        assignedUserId: session.userId,
        status: { notIn: ["COMPLETED", "CANCELLED", "FAILED"] },
      },
    }),
    prisma.printJob.count({ where: { organizationId: organization.id, status: "PRINTING" } }),
    prisma.printJob.count({ where: { organizationId: organization.id, status: "READY" } }),
    prisma.printJob.count({
      where: {
        organizationId: organization.id,
        priority: "URGENT",
        status: { notIn: ["COMPLETED", "CANCELLED", "FAILED"] },
      },
    }),
  ]);
  return { queued, assignedToMe, printing, ready, urgent };
}

export async function claimOnlinePrinterForJob(organizationId: string) {
  // We use a transaction to try and claim an online printer
  // This helps prevent double-booking in concurrent requests
  try {
    return await prisma.$transaction(async (tx) => {
      const printer = await tx.printer.findFirst({
        where: {
          organizationId,
          status: "ONLINE",
          deletedAt: null
        }
      });

      if (!printer) return null;

      // Atomic update with status check
      const updateResult = await tx.printer.updateMany({
        where: {
          id: printer.id,
          status: "ONLINE"
        },
        data: {
          status: "BUSY"
        }
      });

      if (updateResult.count === 0) {
        // Someone else got it in the millisecond between find and update
        throw new Error("CONCURRENT_CLAIM");
      }

      return printer;
    });
  } catch (err: any) {
    if (err.message === "CONCURRENT_CLAIM") {
      // Small recursion to try again
      return claimOnlinePrinterForJob(organizationId);
    }
    throw err;
  }
}

export async function processWaitingJobs(organizationId: string) {
  // 1. Find all jobs waiting for printer or verified but not printing
  const pendingJobs = await prisma.printJob.findMany({
    where: {
      organizationId,
      status: { in: ["OTP_VERIFIED", "WAITING_FOR_PRINTER"] }
    },
    orderBy: { createdAt: "asc" }
  });

  if (pendingJobs.length === 0) return;

  // 2. Try to claim printers for jobs
  for (const job of pendingJobs) {
    const printer = await claimOnlinePrinterForJob(organizationId);
    if (!printer) break; // No more printers available

    await prisma.printJob.update({
      where: { id: job.id },
      data: {
        status: "PRINTING",
        printerId: printer.id,
        processingStartedAt: new Date(),
        events: {
          create: {
            fromStatus: job.status,
            toStatus: "PRINTING",
            note: `Automated background trigger: Printer "${printer.name}" became available.`
          }
        }
      }
    });
  }
}

export async function listPrintQueue(input: QueueQuery) {
  try {
    const { session, organization } = await requireQueueAccess();

    // Auto-trigger background processing whenever queue is listed
    // This ensures verified jobs start as soon as a printer is detected
    await processWaitingJobs(organization.id).catch(err => console.error("Auto-process waiting jobs failed:", err));

    const query = queueQuerySchema.parse(input);
    const skip = (query.page - 1) * query.pageSize;
    const where = {
      organizationId: organization.id,
      ...(query.status === "all" ? {} : { status: query.status }),
      ...(query.priority === "all" ? {} : { priority: query.priority }),
      ...(query.assigned === "mine"
        ? { assignedUserId: session.userId }
        : query.assigned === "unassigned"
          ? { assignedUserId: null }
          : {}),
      ...(query.q
        ? {
            OR: [
              { title: { contains: query.q, mode: "insensitive" as const } },
              { customerUser: { email: { contains: query.q, mode: "insensitive" as const } } },
            ],
          }
        : {}),
    };
    const orderBy =
      query.sort === "title"
        ? { title: query.direction }
        : query.sort === "status"
          ? { status: query.direction }
          : query.sort === "priority"
            ? { priority: query.direction }
            : { createdAt: query.direction };
    const [jobs, total] = await prisma.$transaction([
      prisma.printJob.findMany({
        where,
        include: { customerUser: true, assignedUser: true, printer: true, files: true },
        orderBy,
        skip,
        take: query.pageSize,
      }),
      prisma.printJob.count({ where }),
    ]);
    return {
      jobs,
      total,
      page: query.page,
      pageSize: query.pageSize,
      pageCount: Math.max(1, Math.ceil(total / query.pageSize)),
    };
  } catch (error) {
    unstable_rethrow(error);
    console.error("Error in listPrintQueue:", error);
    return {
      jobs: [],
      total: 0,
      page: 1,
      pageSize: 20,
      pageCount: 1,
    };
  }
}

export async function listAssignedJobs() {
  const { session, organization } = await requireQueueAccess();
  return prisma.printJob.findMany({
    where: {
      organizationId: organization.id,
      assignedUserId: session.userId,
      status: { notIn: ["COMPLETED", "CANCELLED", "FAILED"] },
    },
    include: { customerUser: true, printer: true, files: true },
    orderBy: [{ priority: "desc" }, { createdAt: "asc" }],
  });
}

export async function getQueueJob(jobId: string) {
  const { organization } = await requireQueueAccess();
  return prisma.printJob.findFirst({
    where: { id: jobId, organizationId: organization.id },
    include: {
      customerUser: true,
      assignedUser: true,
      printer: true,
      files: true,
      otpHistory: {
        include: { generatedByUser: true, verifiedByUser: true },
        orderBy: { createdAt: "desc" },
      },
      events: { include: { actorUser: true }, orderBy: { createdAt: "asc" } },
      activities: { orderBy: { createdAt: "desc" } },
    },
  });
}

export async function searchCustomers(q?: string) {
  const { organization } = await requireQueueAccess();
  return prisma.user.findMany({
    where: {
      memberships: { some: { organizationId: organization.id, status: "ACTIVE" } },
      ...(q
        ? {
            OR: [
              { email: { contains: q, mode: "insensitive" as const } },
              { name: { contains: q, mode: "insensitive" as const } },
            ],
          }
        : {}),
    },
    include: {
      memberships: { where: { organizationId: organization.id }, include: { role: true } },
      _count: { select: { customerPrintJobs: true } },
    },
    orderBy: { email: "asc" },
    take: 25,
  });
}

export async function releasePrintJobByOtp(otp: string) {
  const { session, organization } = await requireQueueAccess();

  // 1. Find the OTP record by hash
  const foundOtp = await prisma.printJobOtp.findFirst({
    where: {
      codeHash: hashOtp(otp),
      status: "ACTIVE",
      expiresAt: { gt: new Date() },
      printJob: {
        organizationId: organization.id
      }
    },
    include: { printJob: true }
  });

  // 2. Validate existence
  if (!foundOtp) {
    console.error(`[RELEASE_OTP_FAILURE] OTP record not found or expired.`);
    throw new Error("Invalid or expired collection OTP.");
  }

  // 3. Verify the OTP record
  await prisma.printJobOtp.update({
    where: { id: foundOtp.id },
    data: {
      status: "VERIFIED",
      verifiedAt: new Date(),
      verifiedByUserId: session.userId
    }
  });

  // 4. Update PrintJob to OTP_VERIFIED
  await prisma.printJob.update({
    where: { id: foundOtp.printJobId },
    data: {
      status: "OTP_VERIFIED",
      events: {
        create: {
          fromStatus: foundOtp.printJob.status,
          toStatus: "OTP_VERIFIED",
          actorUserId: session.userId,
          note: "OTP successfully verified by employee."
        }
      }
    }
  });

  // 5. Resolve an actually available connector-reported Windows printer and release to Connector
  try {
    const printer = await resolvePrinterForJob({
      organizationId: organization.id,
      employeeUserId: session.userId,
      allowFallback: true,
    });

    await prisma.printJob.update({
      where: { id: foundOtp.printJobId },
      data: {
        status: "PRINTING",
        printerId: printer.id,
        processingStartedAt: new Date(),
        events: {
          create: {
            fromStatus: foundOtp.printJob.status,
            toStatus: "PRINTING",
            actorUserId: session.userId,
            note: `OTP verified. Released to live connector printer "${printer.name}".`
          }
        }
      }
    });
    return { success: true, message: `OTP Verified. Released to ${printer.name}.`, jobId: foundOtp.printJobId };
  } catch (error: any) {
    await prisma.printJob.update({
      where: { id: foundOtp.printJobId },
      data: {
        status: "FAILED",
        events: {
          create: {
            fromStatus: foundOtp.printJob.status,
            toStatus: "FAILED",
            actorUserId: session.userId,
            note: error?.message || "NO_AVAILABLE_PRINTER"
          }
        }
      }
    });
    throw error;
  }

}
