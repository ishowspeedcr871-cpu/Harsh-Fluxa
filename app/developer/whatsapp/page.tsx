import { DeveloperPortalLayout } from "@/layouts/developer-portal-layout";
import { DeveloperWhatsappClient } from "@/components/developer/developer-whatsapp-client";
import { prisma } from "@/database/client";

export default async function DeveloperWhatsappPage() {
  // Use a platform setting for global whatsapp number
  const globalSetting = await prisma.platformSettings.findUnique({
    where: { key: "whatsapp_number" }
  });

  // Also show which organizations have overrides
  const orgSettings = await prisma.organizationSettings.findMany({
    where: { supportPhone: { not: null } },
    include: { organization: true }
  });

  return (
    <DeveloperPortalLayout>
      <DeveloperWhatsappClient 
        initialGlobalNumber={(globalSetting?.value as string) || null} 
        orgSettings={orgSettings}
      />
    </DeveloperPortalLayout>
  );
}
