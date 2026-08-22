import { NextRequest, NextResponse } from "next/server";
import { verifyOrganizationApiKey, printerHeartbeat, getPendingJobsForPrinter } from "@/services/connector/connector-service";

export async function POST(req: NextRequest) {
  try {
    const apiKey = req.headers.get("x-api-key");
    if (!apiKey) return NextResponse.json({ error: "Missing API Key" }, { status: 401 });

    const organization = await verifyOrganizationApiKey(apiKey);
    if (!organization) return NextResponse.json({ error: "Invalid API Key" }, { status: 401 });

    const body = await req.json();
    const printer = await printerHeartbeat(organization.id, body);

    // After heartbeat, also check if there are pending jobs for this printer
    const pendingJobs = await getPendingJobsForPrinter(organization.id, body.macAddress);

    return NextResponse.json({ 
      success: true, 
      status: printer.status,
      pendingJobCount: pendingJobs.length,
      jobs: pendingJobs.map(j => ({
        id: j.id,
        title: j.title,
        files: j.files.map(f => ({
          id: f.id,
          name: f.fileName,
          mimeType: f.mimeType,
          size: f.fileSize,
          checksumSha256: f.checksumSha256,
          downloadUrl: `/api/files/${f.id}`
        })),
        printer: j.printer ? {
          id: j.printer.id,
          name: j.printer.name,
          connectorId: j.printer.connectorId,
          windowsPrinterId: j.printer.windowsPrinterId
        } : null
      }))
    });
  } catch (error: any) {
    console.error("Connector heartbeat error:", error);
    return NextResponse.json({ error: error.message || "Heartbeat failed" }, { status: 400 });
  }
}
