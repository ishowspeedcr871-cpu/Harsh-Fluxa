import { Button } from "@/components/ui/button";
export function Pagination() {
  return (
    <nav className="flex items-center justify-end gap-2">
      <Button variant="secondary" size="sm">
        Previous
      </Button>
      <Button variant="secondary" size="sm">
        Next
      </Button>
    </nav>
  );
}
