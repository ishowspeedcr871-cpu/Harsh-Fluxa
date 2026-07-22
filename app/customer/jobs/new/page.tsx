import { CustomerUploadWorkspace } from "@/components/customer/customer-upload-workspace";
import { CustomerPortalLayout } from "@/layouts/customer-portal-layout";
import { createPrintJobAction } from "@/services/print-jobs/print-job-service";

export default function NewCustomerPrintJobPage() {
  return (
    <CustomerPortalLayout>
      <CustomerUploadWorkspace createAction={createPrintJobAction} />
    </CustomerPortalLayout>
  );
}
