import { DeveloperPortalLayout } from "@/layouts/developer-portal-layout";
import { getPlatformDashboard } from "@/services/developer/platform-service";
import { MasterDashboardClient } from "@/components/developer/master-dashboard-client";

export default async function DeveloperDashboardPage() {
  const data = await getPlatformDashboard();
  
  return (
    <DeveloperPortalLayout>
      <MasterDashboardClient data={data} />
    </DeveloperPortalLayout>
  );
}
