import { NextResponse } from "next/server";
import { requireEmployeeContext } from "@/services/employee/employee-service";
import { listAvailablePrintersForEmployee } from "@/services/printers/printer-resolution";

export async function GET() {
  const { session, organization } = await requireEmployeeContext();
  const printers = await listAvailablePrintersForEmployee(organization.id, session.userId);
  return NextResponse.json({ success: true, printers });
}
