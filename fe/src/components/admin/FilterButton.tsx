import { Button } from "@/components/ui/button";
import { Filter } from "lucide-react";

interface FilterButtonProps {
  onClick: () => void;
  activeFilters: number;
}

export function FilterButton({ onClick, activeFilters }: FilterButtonProps) {
  return (
    <Button
      variant="outline"
      size="sm"
      className="flex items-center gap-2"
      onClick={onClick}
    >
      <Filter className="h-4 w-4" />
      Filters
      {activeFilters > 0 && (
        <span className="bg-primary text-white rounded-full px-2 py-0.5 text-xs">
          {activeFilters}
        </span>
      )}
    </Button>
  );
}
