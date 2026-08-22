import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/database/client";
import { verifyOrganizationApiKey } from "@/services/connector/connector-service";

export async function POST(req: NextRequest, { params }: { params: Promise<{ jobId: string }> }) {
  const apiKey = req.headers.get("x-api-key");
  const organization = apiKey && await verifyOrganizationApiKey(apiKey);
  if (!organization) return NextResponse.json({ error: "Invalid API Key" }, { status: 401 });
  const { connectorId } = await req.json();
  const { jobId } = await params;
  if (typeof connectorId !== "string" || !connectorId) return NextResponse.json({ error: "connectorId is required" }, { status: 400 });
  const claimed = await prisma.printJob.updateMany({
    where: { id: jobId, organizationId: organization.id, status: "PRINTING", connectorClaimedAt: null, printer: { connectorId, isAvailable: true, windowsPrinterId: { not: null } } },
    data: { connectorClaimedAt: new Date(), connectorClaimId: connectorId },
  });
  return NextResponse.json({ claimed: claimed.count === 1 });
}
