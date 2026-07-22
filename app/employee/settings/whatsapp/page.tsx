import { EmployeePortalLayout } from "@/layouts/employee-portal-layout";
import { prisma } from "@/database/client";
import { getEmployeeProfile } from "@/services/employee/employee-service";
import { WhatsappSettingsClient } from "@/components/employee/whatsapp-settings-client";
import { AlertCircle } from "lucide-react";

export default async function WhatsappSettingsPage() {
  try {
    const { organization } = await getEmployeeProfile();

    const orgSettings = await prisma.organizationSettings.findUnique({
      where: { organizationId: organization.id }
    });

    return (
      <EmployeePortalLayout>
        <WhatsappSettingsClient initialNumber={orgSettings?.supportPhone || null} />
      </EmployeePortalLayout>
    );
  } catch (error: any) {
    console.error("Error in WhatsappSettingsPage:", error);
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
