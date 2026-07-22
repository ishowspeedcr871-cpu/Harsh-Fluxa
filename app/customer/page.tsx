import { CustomerPortalLayout } from "@/layouts/customer-portal-layout";
import { getCustomerDashboard } from "@/services/print-jobs/print-job-service";
import { requireCustomerContext } from "@/services/customer/customer-service";
import { CustomerDashboardClient } from "@/components/customer/customer-dashboard-client";
import { prisma } from "@/database/client";

export default async function CustomerDashboardPage() {
  // Enforce customer login and retrieve active user session
  const { user, organization } = await requireCustomerContext();
  const userEmail = user?.email || null;
  
  const orgSettings = await prisma.organizationSettings.findUnique({
    where: { organizationId: organization.id }
  });
  const whatsappNumber = orgSettings?.supportPhone || null;

  // Retrieve the actual active print job collections from database
  let dashboardData;
  try {
    dashboardData = await getCustomerDashboard();
  } catch (error: any) {
    // If the error is a Next.js redirect thrown by authentication guards, let it bubble up
    if (error?.digest?.startsWith("NEXT_REDIRECT") || error?.message === "NEXT_REDIRECT") {
      throw error;
    }

    // Graceful fallback for demo or first onboarding
    dashboardData = {
      recentJobs: [],
      activeJobs: 0,
      completedJobs: 0,
      unreadNotifications: 0
    };
  }

  // Pre-process real database entries for the high-fidelity UI
  const processedJobs = dashboardData.recentJobs.map((job) => ({
    id: job.id,
    title: job.title,
    status: job.status.replaceAll("_", " "),
    copies: job.copies,
    color: job.color,
    estimatedCost: Number(job.estimatedCost || 0),
    createdAt: job.createdAt.toISOString(),
    otpCode: job.status === "OTP_GENERATED" ? "ACTIVE" : undefined, // In a real app we'd fetch the active OTP
    shopName: "Apex Digital"
  }));

  return (
    <CustomerPortalLayout userEmail={userEmail || undefined}>
      <div className="animate-fade-in">
        <CustomerDashboardClient
          initialJobs={processedJobs}
          userEmail={userEmail}
          activeCount={dashboardData.activeJobs}
          completedCount={dashboardData.completedJobs}
          historyCount={0}
          whatsappNumber={whatsappNumber}
        />
      </div>
    </CustomerPortalLayout>
  );
}

