import { NextRequest, NextResponse } from "next/server";
import { verifyOrganizationApiKey, registerPrinter } from "@/services/connector/connector-service";

export async function POST(req: NextRequest) {
  try {
    const apiKey = req.headers.get("x-api-key");
    if (!apiKey) return NextResponse.json({ error: "Missing API Key" }, { status: 401 });

    const organization = await verifyOrganizationApiKey(apiKey);
    if (!organization) return NextResponse.json({ error: "Invalid API Key" }, { status: 401 });

    const body = await req.json();
    const printer = await registerPrinter(organization.id, body);

    return NextResponse.json({ success: true, printer });
  } catch (error: any) {
    console.error("Connector registration error:", error);
    return NextResponse.json({ error: error.message || "Registration failed" }, { status: 400 });
  }
}
