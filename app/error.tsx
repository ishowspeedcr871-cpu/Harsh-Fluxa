"use client";
import { ErrorState } from "@/components/feedback/error-state";
export default function Error({
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <div className="flex min-h-screen items-center justify-center p-6">
      <ErrorState reset={reset} />
    </div>
  );
}
