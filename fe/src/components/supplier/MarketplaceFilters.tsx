import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import type { MarketplaceFilters as Filters } from "@/api/interfaces/suppliers";
import { Filter } from "lucide-react";

const SERVICE_TYPES = [
  { label: "All Services", value: "" },
  { label: "Local Move", value: "local_move" },
  { label: "Storage", value: "storage" },
  { label: "Move-Out Cleaning", value: "move_out_cleaning" },
  { label: "Heavy Lifting", value: "heavy_lifting" },
  { label: "Company Relocation", value: "company_relocation" },
];

interface MarketplaceFiltersProps {
  filters: Omit<Filters, "page">;
  onFilterChange: (filters: Omit<Filters, "page">) => void;
  onReset: () => void;
}

export function MarketplaceFilters({
  filters,
  onFilterChange,
  onReset,
}: MarketplaceFiltersProps) {
  return (
    <div className="bg-white p-4 rounded-lg shadow-sm border space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Filter className="h-4 w-4" />
          <h3 className="font-medium">Filters</h3>
        </div>
        <Button variant="ghost" size="sm" onClick={onReset}>
          Reset
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="space-y-2">
          <label className="text-sm font-medium">From City</label>
          <Input
            placeholder="From City"
            value={filters.from_city}
            onChange={(e) =>
              onFilterChange({ ...filters, from_city: e.target.value })
            }
          />
        </div>

        <div className="space-y-2">
          <label className="text-sm font-medium">To City</label>
          <Input
            placeholder="To City"
            value={filters.to_city}
            onChange={(e) =>
              onFilterChange({ ...filters, to_city: e.target.value })
            }
          />
        </div>

        <div className="space-y-2">
          <label className="text-sm font-medium">Move Date</label>
          <Input
            type="date"
            value={filters.move_date}
            onChange={(e) =>
              onFilterChange({ ...filters, move_date: e.target.value })
            }
          />
        </div>

        <div className="space-y-2">
          <label className="text-sm font-medium">Service Type</label>
          <Select
            value={filters.type_of_service}
            onValueChange={(value) =>
              onFilterChange({ ...filters, type_of_service: value })
            }
          >
            <SelectTrigger>
              <SelectValue placeholder="Select service type" />
            </SelectTrigger>
            <SelectContent>
              {SERVICE_TYPES.map((type) => (
                <SelectItem key={type.value} value={type.value}>
                  {type.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>
    </div>
  );
}
