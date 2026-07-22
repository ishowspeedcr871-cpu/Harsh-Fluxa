import Link from "next/link";
import { Card, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { PortalLayout } from "@/layouts/portal-layout";

export default function SettingsPage() {
  return (
    <PortalLayout>
      <Card>
        <CardHeader>
          <CardTitle>Settings</CardTitle>
          <CardDescription>
            Global profile settings remain lightweight while tenant settings now live in the
            organization management foundation. Open{" "}
            <Link href="/organization/settings" className="text-accent-cyan hover:underline">
              organization settings
            </Link>{" "}
            to manage tenant identity and support metadata.
          </CardDescription>
        </CardHeader>
      </Card>
    </PortalLayout>
  );
}
