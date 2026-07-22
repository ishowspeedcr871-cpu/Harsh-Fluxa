import { Building2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Select } from "@/components/ui/select";
import { listCurrentUserOrganizations } from "@/services/organizations/organization-service";
import { getSelectedOrganizationId } from "@/services/organizations/context";
import { switchOrganizationAction } from "@/services/organizations/actions";

export async function OrganizationSwitcher() {
  const organizations = await listCurrentUserOrganizations();
  const selectedOrganizationId = await getSelectedOrganizationId();
  const activeOrganizationId = selectedOrganizationId ?? organizations[0]?.organization.id;

  if (organizations.length === 0) {
    return (
      <Button variant="secondary" className="hidden lg:inline-flex" disabled>
        <Building2 className="size-4" aria-hidden="true" />
        No organization
      </Button>
    );
  }

  return (
    <form action={switchOrganizationAction} className="hidden items-center gap-2 lg:flex">
      <Building2 className="size-4 text-accent-cyan" aria-hidden="true" />
      <Select
        name="organizationId"
        aria-label="Switch organization"
        defaultValue={activeOrganizationId}
        className="h-10 min-w-48"
      >
        {organizations.map(({ organization }) => (
          <option key={organization.id} value={organization.id}>
            {organization.name}
          </option>
        ))}
      </Select>
      <Button type="submit" variant="secondary" size="sm">
        Switch
      </Button>
    </form>
  );
}
