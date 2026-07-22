import { OrganizationPortalLayout } from "@/layouts/organization-portal-layout";
import { listPrinters } from "@/services/printers/printer-service";
import { getActiveOrganizationMembership } from "@/services/organizations/organization-service";
import { PrinterInventoryClient } from "@/components/organization/printer-inventory-client";
import { AlertCircle } from "lucide-react";
import { serializeData } from "@/lib/serialization";

export default async function PrintersPage() {
  try {
    const membership = await getActiveOrganizationMembership();
    const printers = await listPrinters();
    const organization = membership?.organization;

    const serializedPrinters = serializeData(printers);

    return (
      <OrganizationPortalLayout 
        organizationName={organization?.name || "Fluxa HQ"}
      >
        <PrinterInventoryClient initialPrinters={serializedPrinters} />
      </OrganizationPortalLayout>
    );
  } catch (error: any) {
    console.error("Printers page error:", error);
    
    // Let Next.js handle redirects (e.g. from permission denied)
    if (error?.digest?.startsWith('NEXT_REDIRECT')) {
      throw error;
    }

    return (
      <OrganizationPortalLayout organizationName="Fluxa HQ">
        <div className="flex flex-col items-center justify-center py-32 space-y-4">
          <div className="size-16 rounded-full bg-red-500/10 flex items-center justify-center">
            <AlertCircle className="size-8 text-red-500" />
          </div>
          <h2 className="text-xl font-bold">Failed to load printers</h2>
          <p className="text-sm text-muted-foreground">An error occurred while connecting to the printer service.</p>
        </div>
      </OrganizationPortalLayout>
    );
  }
}
