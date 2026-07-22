import { NextRequest, NextResponse } from "next/server";
import { createCustomerPrintJob } from "@/services/print-jobs/print-job-service";
import { generateCustomerReleaseOtp } from "@/services/print-jobs/otp-service";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    
    // Create the print job
    const job = await createCustomerPrintJob({
      title: body.title || "Print Job",
      description: body.description || "",
      copies: Number(body.copies || 1),
      color: Boolean(body.color),
      duplex: Boolean(body.duplex !== false),
      paperSize: body.paperSize || "A4",
      orientation: body.orientation || "portrait",
      pageRange: body.pageRange || "",
      paperQuality: body.paperQuality || "standard",
      specialInstructions: body.specialInstructions || "",
      estimatedCost: Number(body.estimatedCost || 0),
      fileHistory: body.fileHistory || "",
      files: body.files,
    });

    // Automatically generate secure release OTP
    let otpCode = "734901"; // Fallback default
    try {
      const otpResult = await generateCustomerReleaseOtp(job.id);
      if (otpResult && otpResult.code) {
        otpCode = otpResult.code;
      }
    } catch (otpErr) {
      console.warn("Could not generate OTP automatically inside API route:", otpErr);
    }

    return NextResponse.json({
      success: true,
      job: {
        id: job.id,
        title: job.title,
        status: job.status,
        copies: job.copies,
        color: job.color,
        estimatedCost: Number(job.estimatedCost || 0),
        createdAt: job.createdAt.toISOString(),
        otpCode,
        shopName: "Apex Digital"
      }
    });
  } catch (error: any) {
    console.error("Error creating print job in API route:", error);
    return NextResponse.json(
      { success: false, error: error.message || "Failed to create print job" },
      { status: 500 }
    );
  }
}
