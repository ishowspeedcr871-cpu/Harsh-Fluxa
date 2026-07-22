import Link from "next/link";
import { Card, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { CustomerPortalLayout } from "@/layouts/customer-portal-layout";
import { listCustomerActivity } from "@/services/customer/notifications";

export default async function CustomerActivityPage() {
  const activities = await listCustomerActivity();
  return (
    <CustomerPortalLayout>
      <section className="grid gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Activity timeline</CardTitle>
            <CardDescription>
              Your tenant-scoped customer activity across print jobs and uploads.
            </CardDescription>
          </CardHeader>
        </Card>
        <div className="space-y-3">
          {activities.map((activity: any) => (
            <div key={activity.id} className="glass-surface rounded-3xl p-4">
              <div className="font-medium">{activity.action}</div>
              <p className="text-sm text-muted-foreground">{activity.description}</p>
              {activity.printJob ? (
                <Link
                  href={`/customer/jobs/${activity.printJob.id}`}
                  className="text-sm text-accent-cyan hover:underline"
                >
                  Open job
                </Link>
              ) : null}
              <p className="mt-2 text-xs text-muted-foreground">
                {activity.createdAt.toLocaleString()}
              </p>
            </div>
          ))}
        </div>
      </section>
    </CustomerPortalLayout>
  );
}
