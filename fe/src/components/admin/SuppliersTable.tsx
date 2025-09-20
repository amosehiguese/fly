import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { useUpdateSupplierStatus } from "@/hooks/admin/useAdminSuppliers";
import type { Supplier } from "@/api/interfaces/admin/suppliers";
import { format } from "date-fns";
import { Search } from "lucide-react";
import { toast } from "sonner";
import { useRouter } from "@/i18n/navigation";
import { FilterButton } from "./FilterButton";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { useState } from "react";
import { useTranslations } from "next-intl";

interface SuppliersTableProps {
  suppliers: Supplier[];
  onSearch: (value: string) => void;
  filtersOpen: boolean;
  onOpenChange: (open: boolean) => void;
  activeFilters: number;
  handleAcceptClick: (id: string) => void;
}

export function SuppliersTable({
  suppliers,
  onSearch,
  filtersOpen,
  onOpenChange,
  activeFilters,
  handleAcceptClick,
}: SuppliersTableProps) {
  const { mutate: updateStatus } = useUpdateSupplierStatus();
  const router = useRouter();
  const [rejectSupplier, setRejectSupplier] = useState<number | null>(null);
  const t = useTranslations("admin.suppliers");
  const tCommon = useTranslations("common");

  const handleReject = () => {
    if (!rejectSupplier) return;

    updateStatus(
      { supplier_id: rejectSupplier },
      {
        onSuccess: () => {
          toast.success("Supplier rejected successfully");
          setRejectSupplier(null);
        },
        onError: () => {
          toast.error("Failed to reject supplier");
        },
      }
    );
  };

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h2 className="text-xl font-semibold mr-auto">{t("title")}</h2>
        <div className="relative w-72 mr-2">
          <Search className="absolute left-2 top-2.5 h-4 w-4 text-gray-500" />
          <Input
            placeholder={t("table.search")}
            onChange={(e) => onSearch(e.target.value)}
            className="pl-8"
          />
        </div>
        <FilterButton
          onClick={() => onOpenChange(!filtersOpen)}
          activeFilters={activeFilters}
        />
      </div>

      <div className="border rounded-lg">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-12">
                <input type="checkbox" className="rounded" />
              </TableHead>
              <TableHead>ID</TableHead>
              <TableHead>{t("table.columns.companyName")}</TableHead>
              <TableHead>{t("table.columns.regStatus")}</TableHead>
              <TableHead>{t("table.columns.joinedDate")}</TableHead>
              <TableHead>{t("table.columns.actions")}</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {suppliers.map((supplier) => (
              <TableRow key={supplier.id}>
                <TableCell>
                  <input type="checkbox" className="rounded" />
                </TableCell>
                <TableCell>{`${supplier.id}`}</TableCell>
                <TableCell>{supplier.company_name}</TableCell>
                <TableCell>
                  <span
                    className={`px-4 capitalize py-1 rounded-full text-xs ${
                      supplier.reg_status === "active"
                        ? "bg-green-100 text-green-800"
                        : supplier.reg_status === "pending"
                          ? "bg-yellow-100 text-yellow-800"
                          : "bg-red-100 text-red-800"
                    }`}
                  >
                    {tCommon(`status.${supplier.reg_status.toLowerCase()}`)}
                  </span>
                </TableCell>
                <TableCell>
                  {format(supplier.created_at, "dd MMM yyyy")}
                </TableCell>
                <TableCell>
                  {supplier.reg_status === "pending" ? (
                    <div className="flex gap-2">
                      <Button
                        size="sm"
                        variant="default"
                        className="bg-green-600 hover:bg-green-700"
                        onClick={() =>
                          handleAcceptClick(supplier.id.toString())
                        }
                      >
                        {t("table.actions.accept")}
                      </Button>
                    </div>
                  ) : (
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => {
                        router.push(`/admin/suppliers/${supplier.id}`);
                      }}
                    >
                      {t("table.actions.view")}
                    </Button>
                  )}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>

      <AlertDialog
        open={!!rejectSupplier}
        onOpenChange={() => setRejectSupplier(null)}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>{tCommon("labels.areYouSure")}</AlertDialogTitle>
            <AlertDialogDescription>
              {t("rejectSupplierConfirmation")}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>{tCommon("buttons.cancel")}</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleReject}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              {tCommon("buttons.reject")}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
