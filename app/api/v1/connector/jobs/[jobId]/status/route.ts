import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/database/client";
import { verifyOrganizationApiKey } from "@/services/connector/connector-service";

const schema = z.object({ connectorId: z.string().min(1), status: z.enum(["PRINT_COMPLETED", "FAILED"]), note: z.string().min(1).max(2_000) });

export async function POST(req: NextRequest, { params }: { params: Promise<{ jobId: string }> }) {
  const apiKey = req.headers.get("x-api-key");
  const organization = apiKey && await verifyOrganizationApiKey(apiKey);
  if (!organization) return NextResponse.json({ error: "Invalid API Key" }, { status: 401 });
  const body = schema.safeParse(await req.json());
  if (!body.success) return NextResponse.json({ error: "Invalid status payload" }, { status: 400 });
  const { jobId } = await params;
  const job = await prisma.printJob.findFirst({ where: { id: jobId, organizationId: organization.id, status: "PRINTING", connectorClaimId: body.data.connectorId, printer: { connectorId: body.data.connectorId } } });
  if (!job) return NextResponse.json({ error: "JOB_NOT_AVAILABLE_FOR_CONNECTOR" }, { status: 409 });
  const updated = await prisma.printJob.update({
    where: { id: job.id },
    data: { status: body.data.status, completedAt: body.data.status === "PRINT_COMPLETED" ? new Date() : null, events: { create: { fromStatus: "PRINTING", toStatus: body.data.status, note: body.data.note } } },
  });
  return NextResponse.json({ success: true, status: updated.status });
}
