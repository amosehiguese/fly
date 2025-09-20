"use client";

import { DatePicker } from "@/components/DatePicker";
import Dropdown from "@/components/Dropdown";
import { Modal } from "@/components/Modal";
import Table from "@/components/Table";
import { Button } from "@/components/ui/button";
import { bidStatuses, quotationTypes } from "@/data/test/filters";
import { formatTableData } from "@/lib/formatTable";
import { DialogTitle } from "@radix-ui/react-dialog";
import React, { useEffect, useState } from "react";
import { useDebounce } from "@/hooks/useDebounce";
import DisputeTableCellButton from "./DisputeTableCellButton";
import { formatDisputesData } from "@/lib/formatDisputesData";
import {
  useFetchDisputes,
  usePrefetchDisputes,
} from "@/hooks/admin/useFetchDisputes";
import { useLocale, useTranslations } from "next-intl";

export interface DisputeFilters {
  quotationType: string;
  orderStatus: "accepted" | "pending" | "rejected" | "";
  // orderLocation: string;
  startDate: Date | undefined;
  endDate: Date | undefined;
}

const defaultFilters: DisputeFilters = {
  quotationType: "",
  orderStatus: "",
  // orderLocation: "",
  startDate: undefined,
  endDate: undefined,
};

const Page = () => {
  const t = useTranslations("admin.disputes");
  const tableHeaders = useTranslations("admin.tableHeaders");
  const commonT = useTranslations("common");
  const locale = useLocale();
  const [currentPage, setCurrentPage] = useState(1);
  const [searchInput, setSearchInput] = useState("");
  const debouncedSearch = useDebounce(searchInput);
  const [isFilterModalOpen, setIsFilterModalOpen] = useState(false);
  const [filters, setFilters] = useState<DisputeFilters>(defaultFilters);
  const [appliedFilters, setAppliedFilters] =
    useState<DisputeFilters>(defaultFilters);
  const {
    data: disputes,
    error,
    isPending,
  } = useFetchDisputes({
    currentPage,
    filters: appliedFilters,
    searchQuery: debouncedSearch,
  });

  const formattedData =
    formatDisputesData(disputes?.data || [], commonT, locale) ?? [];
  const tableData = formattedData.map((item) => ({
    [tableHeaders("id")]: item.id,
    [tableHeaders("orderId")]: item.orderId,
    [tableHeaders("supplierName")]: item.supplierName,
    [tableHeaders("latestMessage")]: item.latestMessage,
    [tableHeaders("latestSender")]: item.latestSender,
    [tableHeaders("disputeStatus")]: item.disputeStatus,
    [tableHeaders("disputeCreated")]: item.disputeCreated,
  }));

  const { cells: disputeCells, headers: disputeHeaders } =
    formatTableData(tableData);

  const { prefetchNext } = usePrefetchDisputes();

  useEffect(() => {
    if (disputes && disputes?.totalPages > currentPage) {
      prefetchNext(currentPage, 10, debouncedSearch, appliedFilters);
    }
  }, [currentPage, debouncedSearch, appliedFilters, prefetchNext, disputes]);

  const handleFilterSelect = (
    value: string,
    filterType: keyof typeof defaultFilters
  ) => {
    setFilters((prev) => ({
      ...prev,
      [filterType]: value,
    }));
  };

  const clearFilterItem = (filterType: keyof typeof defaultFilters) => {
    setFilters((prev) => ({
      ...prev,
      [filterType]: "",
    }));
    setAppliedFilters(filters);
    setCurrentPage(1);
  };

  const applyFilter = () => {
    setAppliedFilters(filters);
    setCurrentPage(1);
    setIsFilterModalOpen(false);
  };

  const resetFilters = () => {
    setCurrentPage(1);
    setFilters(defaultFilters);
    setAppliedFilters(defaultFilters);
    setIsFilterModalOpen(false);
  };

  const handleDateChange = (
    date: Date | undefined,
    dateType: "startDate" | "endDate"
  ) => {
    setFilters({ ...filters, [dateType]: date });
  };

  if (error) {
    return <div>Error loading orders: {(error as Error).message}</div>;
  }

  return (
    <div className="p-4">
      <Table
        cells={disputeCells}
        headers={disputeHeaders}
        isLoading={isPending}
        title={t("title")}
        searchPlaceholder={t("searchPlaceholder")}
        query={searchInput}
        setQuery={setSearchInput}
        isFilterModalOpen={isFilterModalOpen}
        setIsFilterModalOpen={setIsFilterModalOpen}
        extraTableHeaders={[tableHeaders("action")]}
        showPagination
        extraTableColumnCells={(row, rowIndex) => (
          <DisputeTableCellButton
            key={`action-${rowIndex}`}
            row={row}
            rowIndex={rowIndex}
          />
        )}
        columnStyles={{
          5: (status) =>
            status === commonT("status.resolved")
              ? "bg-green-500/[0.2] text-green-700 p-1 rounded-lg flex justify-center "
              : status === commonT("status.pending")
                ? "bg-yellow-500/[0.2] text-yellow-700 p-1 rounded-lg flex justify-center"
                : status === commonT("status.under_review")
                  ? "bg-red-500/[0.2] text-red-700 p-1 rounded-lg flex justify-center"
                  : "",
        }}
        currentPage={currentPage}
        onPageChange={(page) => {
          setCurrentPage(page);
        }}
        totalItems={disputes?.total ?? 0}
        itemsPerPage={10}
      />

      <Modal
        isOpen={isFilterModalOpen}
        onOpenChange={() => setIsFilterModalOpen(!isFilterModalOpen)}
      >
        <div className="flex flex-col ">
          <DialogTitle>Add Filters</DialogTitle>

          <div className="space-y-4 mt-4">
            <div className="flex flex-col px-4">
              <div className="flex flex-row justify-between">
                <label className="text-[#707070]">Type</label>
                <button
                  onClick={() => clearFilterItem("quotationType")}
                  className="text-red-500"
                >
                  Clear
                </button>
              </div>
              <Dropdown
                items={quotationTypes}
                onselect={(value) => handleFilterSelect(value, "quotationType")}
                value={filters.quotationType}
              />
            </div>

            <div className="flex flex-col px-4">
              <div className="flex flex-row justify-between">
                <label className="text-[#707070]">Status</label>
                <button
                  onClick={() => clearFilterItem("orderStatus")}
                  className="text-red-500"
                >
                  Clear
                </button>
              </div>
              <Dropdown
                items={bidStatuses}
                onselect={(value) => handleFilterSelect(value, "orderStatus")}
                value={filters.orderStatus}
              />
            </div>

            {/* <div className="flex flex-col px-4">
              <div className="flex flex-row justify-between">
                <label className="text-[#707070]">Location</label>
                <button
                  onClick={() => clearFilterItem("orderLocation")}
                  className="text-red-500"
                >
                  Clear
                </button>
              </div> */}
            {/* <Dropdown
                items={orderLocations}
                onselect={(value) => handleFilterSelect(value, "orderLocation")}
                value={filters.orderLocation}
              /> */}
            {/* </div> */}
            <div className="flex flex-col px-4">
              <div className="flex flex-row justify-between">
                <label className="text-[#707070]">Select Date</label>
                <button
                  onClick={() => {
                    setFilters({
                      ...filters,
                      startDate: undefined,
                      endDate: undefined,
                    });
                  }}
                  className="text-red-500"
                >
                  Clear
                </button>
              </div>
              <div className="flex justify-between mt-1 gap-x-8">
                <div className="flex-col flex w-full">
                  <label className="">From</label>
                  <DatePicker
                    selectedDate={filters.startDate}
                    onDateChange={(date) => handleDateChange(date, "startDate")}
                  />
                </div>
                <div className="flex flex-col w-full">
                  <label className="">To</label>
                  <DatePicker
                    selectedDate={filters.endDate}
                    onDateChange={(date) => handleDateChange(date, "endDate")}
                  />
                </div>
              </div>
            </div>

            <div className="flex justify-between px-4 mt-2">
              <Button onClick={resetFilters} variant={"outline"}>
                Reset
              </Button>
              <Button onClick={applyFilter} className="bg-black dark:bg-white">
                Apply now
              </Button>
            </div>
          </div>
        </div>
      </Modal>
    </div>
  );
};

export default Page;
