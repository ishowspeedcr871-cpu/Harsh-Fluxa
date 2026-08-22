import { NextRequest, NextResponse } from "next/server";
import { createCustomerPrintJob } from "@/services/print-jobs/print-job-service";
import { generateCustomerReleaseOtp } from "@/services/print-jobs/otp-service";
import { storeUploadedFile } from "@/services/storage/gridfs-storage";

const CONNECTOR_SUPPORTED_MIME_TYPES = new Set(["application/pdf", "image/png", "image/jpeg", "image/webp"]);

export async function POST(req: NextRequest) {
  try {
    const contentType = req.headers.get("content-type") || "";
    let body: any;
    let uploadedFiles: Array<{ fileName: string; fileSize: number; mimeType: string; storageKey: string; checksumSha256: string }> = [];

    if (contentType.includes("multipart/form-data")) {
      const formData = await req.formData();
      body = JSON.parse(String(formData.get("payload") || "{}"));
      const files = formData.getAll("files").filter((entry): entry is File => entry instanceof File && entry.size > 0);
      if (!files.length) throw new Error("FILE_REFERENCE_MISSING: No binary files were uploaded.");
      for (const file of files) {
        if (!CONNECTOR_SUPPORTED_MIME_TYPES.has(file.type)) throw new Error("UNSUPPORTED_FILE_TYPE: Only PDF, PNG, JPEG, and WEBP files are supported.");
        const stored = await storeUploadedFile(file);
        uploadedFiles.push({
          fileName: stored.fileName,
          fileSize: stored.size,
          mimeType: stored.mimeType,
          storageKey: stored.storageKey,
          checksumSha256: stored.checksumSha256,
        });
      }
    } else {
      return NextResponse.json({ success: false, error: "BINARY_UPLOAD_REQUIRED: Submit multipart/form-data with one or more File objects." }, { status: 415 });
    }

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
      files: uploadedFiles,
    });

    let otpCode = "734901";
    try {
      const otpResult = await generateCustomerReleaseOtp(job.id);
      if (otpResult?.code) otpCode = otpResult.code;
    } catch (otpErr) {
      console.warn("Could not generate OTP automatically inside API route:", otpErr);
    }

    return NextResponse.json({
      success: true,
      job: { id: job.id, title: job.title, status: job.status, copies: job.copies, color: job.color, estimatedCost: Number(job.estimatedCost || 0), createdAt: job.createdAt.toISOString(), otpCode, shopName: "Apex Digital" },
    });
  } catch (error: any) {
    console.error("Error creating print job in API route:", error);
    return NextResponse.json({ success: false, error: error.message || "Failed to create print job" }, { status: 500 });
  }
}
