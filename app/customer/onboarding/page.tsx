import Link from "next/link";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { AuthLayout } from "@/layouts/auth-layout";

export default function CustomerOnboardingPage() {
  return (
    <AuthLayout>
      <Card className="w-full max-w-xl">
        <CardHeader>
          <CardTitle>Customer onboarding</CardTitle>
          <CardDescription>
            Join an organization invitation or ask your print administrator to add you before using
            the customer portal.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Link href="/dashboard" className="text-accent-cyan hover:underline">
            Return to dashboard
          </Link>
        </CardContent>
      </Card>
    </AuthLayout>
  );
}
