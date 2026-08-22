import { NextRequest, NextResponse } from "next/server";
import { createHash } from "node:crypto";
import { prisma } from "@/database/client";
import { verifyOrganizationApiKey } from "@/services/connector/connector-service";
import { readStoredFile } from "@/services/storage/gridfs-storage";

export async function GET(req: NextRequest, { params }: { params: Promise<{ fileId: string }> }) {
  try {
    const apiKey = req.headers.get("x-api-key");
    if (!apiKey) return NextResponse.json({ error: "Missing API Key" }, { status: 401 });

    const organization = await verifyOrganizationApiKey(apiKey);
    if (!organization) return NextResponse.json({ error: "Invalid API Key" }, { status: 401 });

    const { fileId } = await params;
    const file = await prisma.printJobFile.findFirst({
      where: { id: fileId, printJob: { organizationId: organization.id } },
      include: { printJob: { select: { id: true, organizationId: true, status: true } } },
    });

    if (!file) return NextResponse.json({ error: "FILE_NOT_FOUND" }, { status: 404 });
    if (!file.storageKey) return NextResponse.json({ error: "FILE_REFERENCE_MISSING" }, { status: 409 });

    const stored = await readStoredFile(file.storageKey);
    if (stored.size !== file.fileSize) return NextResponse.json({ error: "FILE_VALIDATION_FAILED", reason: "size_mismatch" }, { status: 422 });

    const checksum = createHash("sha256").update(stored.body).digest("hex");
    if (file.checksumSha256 && checksum !== file.checksumSha256) {
      return NextResponse.json({ error: "FILE_VALIDATION_FAILED", reason: "checksum_mismatch" }, { status: 422 });
    }

    return new NextResponse(stored.body, {
      headers: {
        "Content-Type": file.mimeType || stored.contentType,
        "Content-Length": String(stored.body.length),
        "Content-Disposition": `attachment; filename="${encodeURIComponent(file.fileName)}"`,
        "X-FLUXA-File-Id": file.id,
        "X-FLUXA-Checksum-Sha256": checksum,
      },
    });
  } catch (error: any) {
    console.error("File download error:", error);
    const message = error?.message || "DOWNLOAD_FAILED";
    return NextResponse.json({ error: message }, { status: message.startsWith("FILE_NOT_FOUND") ? 404 : 500 });
  }
}
