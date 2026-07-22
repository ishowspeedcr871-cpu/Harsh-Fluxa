import { DeveloperPortalLayout } from "@/layouts/developer-portal-layout";
import { DeveloperSecretsClient } from "@/components/developer/developer-secrets-client";
import { prisma } from "@/database/client";

export default async function DeveloperSecretsPage() {
  const dbSettings = await prisma.platformSettings.findMany({
    orderBy: { key: "asc" }
  });

  // Get relevant system environment variables
  const systemKeys = [
    "DATABASE_URL",
    "GEMINI_API_KEY",
    "STRIPE_SECRET_KEY",
    "FIREBASE_PROJECT_ID",
    "GOOGLE_CLIENT_ID",
    "GOOGLE_CLIENT_SECRET",
    "RESEND_API_KEY",
    "UPSTASH_REDIS_REST_URL",
    "UPSTASH_REDIS_REST_TOKEN"
  ];

  const systemSecrets = systemKeys
    .filter(key => process.env[key])
    .map(key => ({
      key,
      value: process.env[key],
      isSystem: true
    }));

  return (
    <DeveloperPortalLayout>
      <DeveloperSecretsClient 
        initialSettings={dbSettings} 
        systemSecrets={systemSecrets}
      />
    </DeveloperPortalLayout>
  );
}
