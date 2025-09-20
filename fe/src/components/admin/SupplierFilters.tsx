import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { useTranslations } from "next-intl";

interface SupplierFilters {
  reg_status?: string;
  start_date?: string;
  end_date?: string;
}

interface SupplierFiltersProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  filters: SupplierFilters;
  onFilterChange: (filters: SupplierFilters) => void;
  onReset: () => void;
}

export function SupplierFilters({
  open,
  onOpenChange,
  filters,
  onFilterChange,
  onReset,
}: SupplierFiltersProps) {
  const t = useTranslations("admin.suppliers");
  const tCommon = useTranslations("common");

  const handleStatusChange = (value: string) => {
    onFilterChange({
      ...filters,
      reg_status: value === "all" ? undefined : value,
    });
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>{t("filters.title")}</DialogTitle>
        </DialogHeader>
        <div className="space-y-4">
          <div className="space-y-2">
            <label className="text-sm font-medium">
              {t("filters.regStatus")}
            </label>
            <Select
              value={filters.reg_status || "all"}
              onValueChange={handleStatusChange}
            >
              <SelectTrigger>
                <SelectValue placeholder={t("filters.regStatus")} />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">{tCommon("status.all")}</SelectItem>
                <SelectItem value="active">
                  {tCommon("status.active")}
                </SelectItem>
                <SelectItem value="pending">
                  {tCommon("status.pending")}
                </SelectItem>
                <SelectItem value="rejected">
                  {tCommon("status.rejected")}
                </SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium">
              {t("filters.startDate")}
            </label>
            <Input
              type="date"
              value={filters.start_date || ""}
              onChange={(e) =>
                onFilterChange({ ...filters, start_date: e.target.value })
              }
            />
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium">
              {t("filters.endDate")}
            </label>
            <Input
              type="date"
              value={filters.end_date || ""}
              onChange={(e) =>
                onFilterChange({ ...filters, end_date: e.target.value })
              }
            />
          </div>

          <div className="flex justify-between pt-4 ">
            <Button variant="outline" onClick={onReset}>
              {t("filters.reset")}
            </Button>
            <Button
              className="dark:text-white"
              onClick={() => onOpenChange(false)}
            >
              {t("filters.apply")}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
