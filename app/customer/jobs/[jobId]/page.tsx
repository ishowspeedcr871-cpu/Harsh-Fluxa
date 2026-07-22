import { notFound } from "next/navigation";
import Link from "next/link";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { CustomerPortalLayout } from "@/layouts/customer-portal-layout";
import { getCustomerPrintJob } from "@/services/print-jobs/print-job-service";
import { generateCustomerReleaseOtpAction } from "@/services/print-jobs/otp-service";
import { OtpSection } from "@/components/customer/otp-section";
import { PrintReceiptButton } from "@/components/customer/print-button";
import {
  FileText,
  Clock,
  ArrowLeft,
  Receipt,
} from "lucide-react";

export default async function CustomerJobDetailsPage({
  params,
  searchParams,
}: {
  params: Promise<{ jobId: string }>;
  searchParams: Promise<Record<string, string | undefined>>;
}) {
  const { jobId } = await params;
  const urlParams = await searchParams;
  const job = await getCustomerPrintJob(jobId);
  if (!job) notFound();

  const isCompleted = job.status === "COMPLETED" || job.status === "COLLECTED";
  const costVal = Number(job.estimatedCost || 0);
  const otpCode = urlParams.otp_code || "";

  // Helper to map DB status to simplified consumer-facing timeline steps
  const getTimelineSteps = () => {
    const dbStatus = job.status;
    
    let currentStep = 0; 
    
    if (["QUEUED", "ASSIGNED"].includes(dbStatus)) {
      currentStep = 1;
    } else if (dbStatus === "PRINTING") {
      currentStep = 2;
    } else if (["READY", "OTP_GENERATED"].includes(dbStatus)) {
      currentStep = 3;
    } else if (["COLLECTED", "COMPLETED"].includes(dbStatus)) {
      currentStep = 4;
    }

    return [
      {
        label: "Order Submitted",
        description: "Document uploaded & validated",
        time: job.createdAt,
        active: currentStep >= 0,
        completed: currentStep > 0,
      },
      {
        label: "In Queue",
        description: "Assigned to high-speed printer",
        time: job.queuedAt,
        active: currentStep >= 1,
        completed: currentStep > 1,
      },
      {
        label: "Printing Document",
        description: "Physical printing in progress",
        time: job.processingStartedAt,
        active: currentStep >= 2,
        completed: currentStep > 2,
      },
      {
        label: "Ready for Collection",
        description: "Generate OTP to release prints",
        time: job.readyAt,
        active: currentStep >= 3,
        completed: currentStep > 3,
      },
      {
        label: "Collected & Completed",
        description: "Thank you for printing with Fluxa!",
        time: job.completedAt,
        active: currentStep >= 4,
        completed: currentStep > 4,
      },
    ];
  };

  const steps = getTimelineSteps();

  return (
    <CustomerPortalLayout>
      <section className="space-y-8 animate-fade-in pb-16">
        <div className="flex items-center justify-between">
          <Link
            href="/customer"
            className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-white transition-colors"
          >
            <ArrowLeft className="size-4" />
            <span>Back to My Orders</span>
          </Link>
          <span className="text-xs font-mono text-muted-foreground bg-white/[0.04] px-3 py-1 rounded-full border border-white/5">
            JOB ID: {job.id.substring(0, 8).toUpperCase()}
          </span>
        </div>

        <div className="grid gap-8 lg:grid-cols-[1.15fr_.85fr]">
          <div className="space-y-6">
            <Card className="border border-white/10 bg-white/[0.02] shadow-glass rounded-3xl p-6">
              <div className="space-y-3">
                <div className="flex flex-wrap items-center justify-between gap-3">
                  <h1 className="text-2xl font-bold text-white tracking-tight">{job.title}</h1>
                  <span className="text-xs font-semibold px-3 py-1 rounded-full bg-accent-cyan/10 text-accent-cyan border border-accent-cyan/20 uppercase tracking-wider">
                    {job.status.replaceAll("_", " ")}
                  </span>
                </div>
                {job.description && (
                  <p className="text-sm text-muted-foreground">{job.description}</p>
                )}
                
                <div className="grid grid-cols-2 gap-4 border-t border-white/5 pt-4 mt-4 text-xs text-muted-foreground">
                  <div>
                    <span className="block text-[10px] uppercase font-semibold text-muted-foreground">COPIES</span>
                    <strong className="text-white text-sm mt-0.5 block">{job.copies} Copy/Copies</strong>
                  </div>
                  <div>
                    <span className="block text-[10px] uppercase font-semibold text-muted-foreground">COLOR MODE</span>
                    <strong className="text-white text-sm mt-0.5 block">{job.color ? "Full Color" : "Black & White"}</strong>
                  </div>
                  <div>
                    <span className="block text-[10px] uppercase font-semibold text-muted-foreground">PAPER CONFIGURATION</span>
                    <strong className="text-white text-sm mt-0.5 block">
                      {String(job.metadata?.uploadConfiguration?.paperSize || "A4")} · {job.duplex ? "Duplex" : "Simplex"}
                    </strong>
                  </div>
                  <div>
                    <span className="block text-[10px] uppercase font-semibold text-muted-foreground">ORIENTATION</span>
                    <strong className="text-white text-sm mt-0.5 block capitalize">
                      {String(job.metadata?.uploadConfiguration?.orientation || "portrait")}
                    </strong>
                  </div>
                </div>
              </div>
            </Card>

            <Card className="border border-white/10 bg-white/[0.02] shadow-glass rounded-3xl p-6">
              <CardHeader className="px-0 pt-0 pb-6">
                <CardTitle className="text-lg font-bold text-white flex items-center gap-2">
                  <Clock className="size-5 text-accent-cyan" />
                  <span>Track Print Status</span>
                </CardTitle>
                <CardDescription className="text-xs text-muted-foreground">
                  Follow your document's real-time physical production path.
                </CardDescription>
              </CardHeader>
              <CardContent className="px-0 pb-0">
                <div className="relative pl-6 border-l border-white/10 space-y-8 ml-3">
                  {steps?.map((step) => {
                    return (
                      <div key={step.label} className="relative">

                        <div
                          className={`absolute -left-[31px] top-1.5 size-[11px] rounded-full border-2 transition-all duration-300 ${
                            step.completed
                              ? "bg-success border-success scale-110 shadow-lg shadow-success/20"
                              : step.active
                              ? "bg-accent-cyan border-accent-cyan scale-125 shadow-lg shadow-accent-cyan/35 animate-pulse"
                              : "bg-black border-white/20"
                          }`}
                        />

                        <div className="space-y-1">
                          <div className="flex items-center justify-between gap-4">
                            <h4
                              className={`text-sm font-semibold transition-colors ${
                                step.active ? "text-white" : "text-muted-foreground"
                              }`}
                            >
                              {step.label}
                            </h4>
                            {step.time && (
                              <span className="text-[10px] font-mono text-muted-foreground">
                                {new Date(step.time).toLocaleTimeString([], {
                                  hour: "2-digit",
                                  minute: "2-digit",
                                })}
                              </span>
                            )}
                          </div>
                          <p className="text-xs text-muted-foreground">{step.description}</p>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </CardContent>
            </Card>

            <Card className="border border-white/10 bg-white/[0.02] shadow-glass rounded-3xl p-6">
              <CardHeader className="px-0 pt-0 pb-4">
                <CardTitle className="text-lg font-bold text-white">Files to Print</CardTitle>
              </CardHeader>
              <CardContent className="px-0 pb-0 space-y-3">
                {job.files?.map((file) => (
                  <div
                    key={file.id}
                    className="flex items-center justify-between p-3.5 rounded-2xl border border-white/10 bg-white/[0.01]"
                  >
                    <div className="flex items-center gap-3 min-w-0">
                      <FileText className="size-5 text-accent-magenta shrink-0" />
                      <div className="min-w-0">
                        <p className="truncate text-xs font-semibold text-white">{file.fileName}</p>
                        <p className="text-[10px] text-muted-foreground">
                          {(file.fileSize / 1024).toFixed(1)} KB · {file.mimeType.split("/")[1]?.toUpperCase() || "PDF"}
                        </p>
                      </div>
                    </div>
                    <span className="text-[10px] font-semibold text-success bg-success/10 px-2 py-0.5 rounded-full">
                      Ready
                    </span>
                  </div>
                ))}
              </CardContent>
            </Card>
          </div>

          <div className="space-y-6">
            <OtpSection 
              jobId={job.id} 
              isCompleted={isCompleted} 
              initialOtp={otpCode}
              otpHistory={job.otpHistory}
              generateAction={generateCustomerReleaseOtpAction}
            />

            <Card className="relative overflow-hidden border border-white/10 bg-white/[0.02] shadow-glass rounded-3xl p-6">
              <CardHeader className="px-0 pt-0 pb-4">
                <CardTitle className="text-base font-bold text-white flex items-center gap-2">
                  <Receipt className="size-4 text-accent-magenta" />
                  <span>Receipt Breakdown</span>
                </CardTitle>
                <CardDescription className="text-xs">
                  Generate, preview, or print your itemized consumer receipt.
                </CardDescription>
              </CardHeader>
              <CardContent className="px-0 pb-0 space-y-4">
                <div className="rounded-2xl border border-dashed border-white/20 bg-black/40 p-5 space-y-4 font-mono text-xs text-muted-foreground">
                  <div className="text-center border-b border-dashed border-white/10 pb-3 space-y-1">
                    <h5 className="font-sans font-bold text-white text-sm">FLUXA PRINTING</h5>
                    <p className="text-[10px]">Instant Cloud Release Network</p>
                    <p className="text-[9px] text-muted-foreground/60">{new Date(job.createdAt).toLocaleString()}</p>
                  </div>

                  <div className="space-y-1.5">
                    <div className="flex justify-between text-white">
                      <span>Item:</span>
                      <span className="truncate max-w-[120px]">{job.title}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Mode:</span>
                      <span>{job.color ? "Full Color" : "Black & White"}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Paper size:</span>
                      <span>{String(job.metadata?.uploadConfiguration?.paperSize || "A4")}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Copies:</span>
                      <span>{job.copies}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Rate:</span>
                      <span>{job.color ? "₹10/copy" : "₹2/copy"}</span>
                    </div>
                  </div>

                  <div className="border-t border-dashed border-white/10 pt-3 flex justify-between text-white font-bold text-sm">
                    <span>Total Paid:</span>
                    <span className="text-accent-cyan">₹{costVal}</span>
                  </div>

                  <div className="text-center text-[9px] text-muted-foreground/40 pt-2 border-t border-dashed border-white/10">
                    Thank you for choosing Fluxa!
                  </div>
                </div>

                <PrintReceiptButton />
              </CardContent>
            </Card>
          </div>
        </div>
      </section>
    </CustomerPortalLayout>
  );
}
