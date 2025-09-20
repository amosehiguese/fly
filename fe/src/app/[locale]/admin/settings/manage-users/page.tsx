"use client";

import Table from "@/components/Table";
import { Separator } from "@/components/ui/separator";
import React, { useState } from "react";
// import { useDebounce } from "@/hooks/useDebounce";
// import { AdminFilters, defaultAdminFilters } from "@/data/test/adminUsers";
// import { useAdminUsers } from "@/hooks/useFetchAdmins";
import UsersTableCellButton from "./UsersTableCellButton";
import CreateAdminModal from "./CreateAdminModal";
import { useFetchAdmins } from "@/hooks/admin/useFetchAdmins";
import { useTranslations } from "next-intl";

const Page = () => {
  const [currentPage, setCurrentPage] = useState(1);
  const [searchInput, setSearchInput] = useState("");
  // const debouncedSearch = useDebounce(searchInput);
  const [isFilterModalOpen, setIsFilterModalOpen] = useState(false);
  // const [filters, setFilters] = useState<AdminFilters>(defaultAdminFilters);
  // const [appliedFilters, setAppliedFilters] = useState<AdminFilters>(filters);
  const t = useTranslations("admin.settings.userManagement");

  const { data: adminUsersData, isPending } = useFetchAdmins();

  const adminHeaders = [
    t("table.headers.id"),
    t("table.headers.username"),
    t("table.headers.firstName"),
    t("table.headers.lastName"),
    t("table.headers.phone"),
    t("table.headers.role"),
  ];
  const adminCells =
    adminUsersData?.map((user) => [
      user.id.toString(),
      user.username,
      user.firstname,
      user.lastname,
      user.phone_number,
      user.role,
    ]) || [];

  // const handleFilterSelect = (
  //   value: string,
  //   filterType: keyof AdminFilters
  // ) => {
  //   setFilters((prev) => ({
  //     ...prev,
  //     [filterType]: value,
  //   }));
  // };

  // const clearFilterItem = (filterType: keyof AdminFilters) => {
  //   setFilters((prev) => ({
  //     ...prev,
  //     [filterType]: "",
  //   }));
  // };

  // const applyFilter = () => {
  //   setAppliedFilters(filters);
  //   setCurrentPage(1);
  //   setIsFilterModalOpen(false);
  // };

  // const resetFilters = () => {
  //   setCurrentPage(1);
  //   setFilters(defaultAdminFilters);
  //   setAppliedFilters(defaultAdminFilters);
  //   setIsFilterModalOpen(false);
  // };

  return (
    <div className="flex flex-col h-full">
      <div className="border-l border-[#C4C4C4] p-4">
        <h2 className="text-[26px] font-semibold text-subtitle dark:text-white">
          {t("title")}
        </h2>
        <p className="text-subtitle">{t("subtitle")}</p>

        <Separator className="bg-[#C4C4C4] w-full h-[1px] my-4" />

        <div className="flex justify-end mb-4">
          <CreateAdminModal />
        </div>

        <div className="relative">
          <div className="overflow-x-auto">
            <Table
              cells={adminCells}
              headers={adminHeaders}
              isLoading={isPending}
              title={t("table.title")}
              query={searchInput}
              setQuery={setSearchInput}
              isFilterModalOpen={isFilterModalOpen}
              setIsFilterModalOpen={setIsFilterModalOpen}
              showPagination
              columnStyles={{
                5: (status) =>
                  status === "Active"
                    ? "bg-green-500/[0.2] text-green-700 p-1 rounded-lg flex justify-center"
                    : status === "Inactive"
                      ? "bg-red-500/[0.2] text-red-700 p-1 rounded-lg flex justify-center"
                      : "",
              }}
              extraTableHeaders={[t("table.headers.action")]}
              extraTableColumnCells={(row, rowIndex) => (
                <UsersTableCellButton
                  key={`action-${rowIndex}`}
                  row={row}
                  rowIndex={rowIndex}
                />
              )}
              currentPage={currentPage}
              onPageChange={(page) => setCurrentPage(page)}
              totalItems={adminUsersData?.length ?? 0}
              itemsPerPage={10}
            />
          </div>
        </div>
      </div>
    </div>
  );
};

export default Page;
