import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Progress } from "@/components/ui/progress";
import { addPrintJobUploadAction } from "@/services/print-jobs/upload-service";

export function UploadWorkflow({ printJobId }: { printJobId: string }) {
  return (
    <div className="space-y-4">
      <div className="glass-surface rounded-3xl border border-dashed border-accent-cyan/40 p-6 text-center">
        <p className="text-sm font-medium">Drag & drop files here</p>
        <p className="mt-2 text-xs text-muted-foreground">
          Browser file transfer is reserved for the storage phase. Add file metadata now to validate
          the workflow.
        </p>
      </div>
      <form action={addPrintJobUploadAction} className="grid gap-3 md:grid-cols-4">
        <input type="hidden" name="printJobId" value={printJobId} />
        <Input name="fileName" placeholder="document.pdf" required />
        <Input name="fileSize" type="number" placeholder="1048576" required />
        <Input name="mimeType" placeholder="application/pdf" required />
        <Button type="submit">Add upload</Button>
      </form>
      <Progress value={65} />
    </div>
  );
}
