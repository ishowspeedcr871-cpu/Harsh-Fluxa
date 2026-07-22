import { EmptyState } from "@/components/feedback/empty-state";
export default function NotFound() {
  return (
    <div className="flex min-h-screen items-center justify-center p-6">
      <EmptyState
        title="Page not found"
        description="The requested FLUXA surface does not exist yet."
      />
    </div>
  );
}
