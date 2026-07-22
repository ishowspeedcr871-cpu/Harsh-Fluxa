import { EmployeePortalLayout } from "@/layouts/employee-portal-layout";
import { prisma } from "@/database/client";
import { requireEmployeeContext } from "@/services/employee/employee-service";
import { EmployeePrintersClient } from "@/components/employee/employee-printers-client";
import { serializeData } from "@/lib/serialization";
import { AlertCircle } from "lucide-react";

export default async function PrintersPage() {
  try {
    const { organization } = await requireEmployeeContext();

    // 1. Fetch registered printers for this organization
    const printers = await prisma.printer.findMany({
      where: { organizationId: organization.id, deletedAt: null },
      orderBy: [{ status: "asc" }, { name: "asc" }],
    });

    // 2. Fetch active print jobs in the organization to feed the global queue table
    const jobs = await prisma.printJob.findMany({
      where: { 
        organizationId: organization.id,
        status: { notIn: ["CANCELLED", "FAILED"] }
      },
      include: { 
        customerUser: true,
        printer: true 
      },
      orderBy: { createdAt: "desc" },
      take: 10,
    });

    // 3. Prevent Client Component serialization crashes
    const serializedPrinters = serializeData(printers);
    const serializedJobs = serializeData(jobs);

    return (
      <EmployeePortalLayout>
        <EmployeePrintersClient 
          initialPrinters={serializedPrinters} 
          initialJobs={serializedJobs}
          organizationName={organization.name}
        />
      </EmployeePortalLayout>
    );
  } catch (error: any) {
    console.error("Error in PrintersPage:", error);
    return (
      <EmployeePortalLayout>
        <div className="rounded-[24px] border border-danger/35 bg-danger/10 p-6 flex gap-4 text-danger">
          <AlertCircle className="size-6 shrink-0" />
          <div>
            <h3 className="font-black text-white uppercase tracking-wider text-sm mb-1">Access Restricted</h3>
            <p className="text-xs">{error.message || "Could not retrieve printing network statistics."}</p>
          </div>
        </div>
      </EmployeePortalLayout>
    );
  }
}
