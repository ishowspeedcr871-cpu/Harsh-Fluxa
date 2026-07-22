import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
export function ErrorState({
  title = "Something went wrong",
  reset,
}: {
  title?: string;
  reset?: () => void;
}) {
  return (
    <Card className="mx-auto max-w-lg text-center">
      <h2 className="text-xl font-semibold text-danger">{title}</h2>
      <p className="mt-2 text-sm text-muted-foreground">
        The interface recovered safely. Please try again.
      </p>
      {reset ? (
        <Button className="mt-6" variant="secondary" onClick={reset}>
          Try again
        </Button>
      ) : null}
    </Card>
  );
}
