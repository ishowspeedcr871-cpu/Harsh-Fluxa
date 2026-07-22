import { Search } from "lucide-react";
import { Input } from "@/components/ui/input";
export function SearchBar({ placeholder = "Search" }: { placeholder?: string }) {
  return (
    <div className="relative">
      <Search className="pointer-events-none absolute left-4 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
      <Input className="pl-10" placeholder={placeholder} />
    </div>
  );
}
