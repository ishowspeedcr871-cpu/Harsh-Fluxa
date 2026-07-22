import { redirect } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { AuthLayout } from "@/layouts/auth-layout";
import { getCurrentSession } from "@/services/auth/session";
import { onboardOrganizationAction } from "@/services/organizations/actions";

const errorMessages: Record<string, string> = {
  invalid_input: "Enter a valid organization name, slug, timezone, and currency.",
};

export default async function OrganizationOnboardingPage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string }>;
}) {
  const sessionData = await getCurrentSession();
  if (!sessionData) redirect("/login");
  if (sessionData.user.memberships.length > 0) redirect("/dashboard");

  const params = await searchParams;
  const error = params.error ? errorMessages[params.error] : undefined;

  return (
    <AuthLayout>
      <Card className="w-full max-w-xl">
        <CardHeader>
          <CardTitle>Create your organization</CardTitle>
          <CardDescription>
            Set up the tenant workspace that will own users, print operations, settings, and audit
            history.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form action={onboardOrganizationAction} className="space-y-4">
            <Input name="name" placeholder="Organization name" required minLength={2} />
            <Input name="slug" placeholder="organization-slug" required minLength={3} />
            <div className="grid gap-4 md:grid-cols-2">
              <Input name="timezone" placeholder="UTC" defaultValue="UTC" />
              <Input name="currency" placeholder="USD" defaultValue="USD" maxLength={3} />
            </div>
            {error ? <p className="text-sm text-danger">{error}</p> : null}
            <Button type="submit" className="w-full">
              Create organization
            </Button>
          </form>
        </CardContent>
      </Card>
    </AuthLayout>
  );
}
