"use client";

import { useState } from "react";
import { SupplierOverview } from "@/components/admin/SupplierOverview";
import { SuppliersTable } from "@/components/admin/SuppliersTable";
import { SupplierFilters } from "@/components/admin/SupplierFilters";
import { useAdminSuppliers } from "@/hooks/admin/useAdminSuppliers";
import { FullPageLoader } from "@/components/ui/loading/FullPageLoader";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import AcceptSupplier from "@/components/admin/AcceptSupplier";
import { useTranslations } from "next-intl";

interface SupplierFilters {
  company_name?: string;
  reg_status?: string;
  start_date?: string;
  end_date?: string;
}

const defaultFilters: SupplierFilters = {
  company_name: "",
  reg_status: "",
  start_date: "",
  end_date: "",
};

export default function AdminSuppliersPage() {
  const [filters, setFilters] = useState<SupplierFilters>(defaultFilters);
  const [filtersOpen, setFiltersOpen] = useState(false);
  const { data, isLoading } = useAdminSuppliers(filters);
  const activeFilters = Object.values(filters).filter(
    (value) => value !== "" && value !== undefined
  ).length;
  const [selectedSupplierId, setSelectedSupplierId] = useState<string | null>(
    null
  );
  const [isModalOpen, setIsModalOpen] = useState(false);
  const t = useTranslations("admin.suppliers");

  const handleFilterChange = (newFilters: SupplierFilters) => {
    setFilters(newFilters);
  };

  const handleFilterReset = () => {
    setFilters(defaultFilters);
  };

  const handleAcceptClick = (id: string) => {
    setSelectedSupplierId(id);
    setIsModalOpen(true);
  };

  if (isLoading) return <FullPageLoader />;

  return (
    <div className="container p-6 space-y-6">
      <SupplierOverview
        totalMovers={data?.count || 0}
        pendingApprovals={data?.pendingCount || 0}
      />
      <SupplierFilters
        filters={filters}
        onFilterChange={handleFilterChange}
        onReset={handleFilterReset}
        open={filtersOpen}
        onOpenChange={setFiltersOpen}
      />
      <SuppliersTable
        suppliers={data?.suppliers || []}
        onSearch={(value) => setFilters({ ...filters, company_name: value })}
        filtersOpen={filtersOpen}
        onOpenChange={setFiltersOpen}
        activeFilters={activeFilters}
        handleAcceptClick={handleAcceptClick}
      />

      <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>{t("acceptSupplier")}</DialogTitle>
          </DialogHeader>
          {selectedSupplierId && (
            <AcceptSupplier
              params={{ id: selectedSupplierId }}
              setIsModalClose={() => setIsModalOpen(false)}
            />
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
