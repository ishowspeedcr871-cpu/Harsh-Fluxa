import { CustomerPortalLayout } from "@/layouts/customer-portal-layout";
import { listCustomerPrintJobs } from "@/services/print-jobs/print-job-service";
import { CustomerHistoryList } from "@/components/customer/customer-history-list";

export default async function CustomerHistoryPage() {
  const { jobs } = await listCustomerPrintJobs({ page: 1, pageSize: 50, status: "all" });
  
  const formattedJobs = jobs.map((job) => ({
    id: job.id,
    title: job.title,
    status: job.status,
    copies: job.copies,
    color: job.color,
    estimatedCost: Number(job.estimatedCost || 0),
    createdAt: job.createdAt.toISOString(),
    otpCode: job.otpCode,
    shopName: job.shopName,
  }));
  
  return (
    <CustomerPortalLayout>
      <div className="space-y-6">
        <header className="space-y-1">
          <h1 className="text-2xl font-bold tracking-tight text-white">Order History</h1>
          <p className="text-sm text-muted-foreground">Track and manage your document print history.</p>
        </header>

        <CustomerHistoryList jobs={formattedJobs} />
      </div>
    </CustomerPortalLayout>
  );
}
