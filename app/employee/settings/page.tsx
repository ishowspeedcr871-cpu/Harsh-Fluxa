import { EmployeePortalLayout } from "@/layouts/employee-portal-layout";
import { prisma } from "@/database/client";
import { getEmployeeProfile } from "@/services/employee/employee-service";
import { EmployeeSettingsClient } from "@/components/employee/employee-settings-client";
import { serializeData } from "@/lib/serialization";
import { AlertCircle } from "lucide-react";

export default async function SettingsPage() {
  try {
    const { user, membership, organization } = await getEmployeeProfile();

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

    // 3. Serialize data safely
    const serializedUser = serializeData(user);
    const serializedMembership = serializeData(membership);
    const serializedOrganization = serializeData(organization);
    const serializedPrinters = serializeData(printers);
    const serializedJobs = serializeData(awaitingJobs);

    return (
      <EmployeePortalLayout>
        <EmployeeSettingsClient
          user={serializedUser}
          membership={serializedMembership}
          organization={serializedOrganization}
          initialPrinters={serializedPrinters}
          initialJobs={serializedJobs}
        />
      </EmployeePortalLayout>
    );
  } catch (error: any) {
    console.error("Error in SettingsPage:", error);
    return (
      <EmployeePortalLayout>
        <div className="rounded-[24px] border border-danger/35 bg-danger/10 p-6 flex gap-4 text-danger">
          <AlertCircle className="size-6 shrink-0" />
          <div>
            <h3 className="font-black text-white uppercase tracking-wider text-sm mb-1">
              Settings Restricted
            </h3>
            <p className="text-xs">
              {error.message || "Unable to retrieve your workspace settings profile."}
            </p>
          </div>
        </div>
      </EmployeePortalLayout>
    );
  }
}
