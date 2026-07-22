import { EmployeePortalLayout } from "@/layouts/employee-portal-layout";
import { getEmployeeProfile } from "@/services/employee/employee-service";
import { EmployeeProfileClient } from "@/components/employee/employee-profile-client";
import { serializeData } from "@/lib/serialization";
import { AlertCircle } from "lucide-react";

export default async function EmployeeProfilePage() {
  try {
    const { user, membership, organization } = await getEmployeeProfile();

    // Serialize data safely
    const serializedUser = serializeData(user);
    const serializedMembership = serializeData(membership);
    const serializedOrganization = serializeData(organization);

    return (
      <EmployeePortalLayout>
        <EmployeeProfileClient
          user={serializedUser}
          membership={serializedMembership}
          organization={serializedOrganization}
        />
      </EmployeePortalLayout>
    );
  } catch (error: any) {
    console.error("Error in EmployeeProfilePage:", error);
    return (
      <EmployeePortalLayout>
        <div className="rounded-[24px] border border-danger/35 bg-danger/10 p-6 flex gap-4 text-danger">
          <AlertCircle className="size-6 shrink-0" />
          <div>
            <h3 className="font-black text-white uppercase tracking-wider text-sm mb-1">
              Profile Restricted
            </h3>
            <p className="text-xs">
              {error.message || "Unable to retrieve your employee profile."}
            </p>
          </div>
        </div>
      </EmployeePortalLayout>
    );
  }
}
