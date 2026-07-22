import { requireMasterDeveloper } from "@/services/developer/platform-authorization";
import { DeveloperPortalClient } from "./developer-portal-client";

export async function DeveloperPortalLayout({ children }: { children: React.ReactNode }) {
  await requireMasterDeveloper();
  
  return (
    <DeveloperPortalClient>
      {children}
    </DeveloperPortalClient>
  );
}
