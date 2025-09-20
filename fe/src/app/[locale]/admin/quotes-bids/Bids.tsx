"use client";

import { DatePicker } from "@/components/DatePicker";
import Dropdown from "@/components/Dropdown";
import { Button } from "@/components/ui/button";
import { DialogTitle } from "@/components/ui/dialog";
import React, { useEffect, useState } from "react";
import Table from "@/components/Table";
import { useDebounce } from "@/hooks/useDebounce";
import { useFetchBids, usePrefetchBids } from "@/hooks/admin/useFetchBids";
import { formatBidsData } from "@/lib/formatBidsData";
import { formatTableData } from "@/lib/formatTable";
import { bidStatuses } from "@/data/test/filters";
import BidTableCellButton from "./BidTableCellButton";
import { useLocale, useTranslations } from "next-intl";
import { Modal } from "@/components/Modal";

export interface BidFilters {
  orderType: string;
  orderStatus: "accepted" | "pending" | "rejected" | "";
  orderLocation: string;
  startDate: Date | undefined;
  endDate: Date | undefined;
}

const defaultFilters: BidFilters = {
  orderType: "",
  orderStatus: "",
  orderLocation: "",
  startDate: undefined,
  endDate: undefined,
};

const Bids = () => {
  const t = useTranslations("admin.bids");
  const tCommon = useTranslations("common");
  const tableHeaders = useTranslations("admin.tableHeaders");
  const locale = useLocale();
  const [currentPage, setCurrentPage] = useState(1);
  const [searchInput, setSearchInput] = useState("");
  const debouncedSearch = useDebounce(searchInput);
  const [isFilterModalOpen, setIsFilterModalOpen] = useState(false);
  const [filters, setFilters] = useState<BidFilters>(defaultFilters);
  const [appliedFilters, setAppliedFilters] =
    useState<BidFilters>(defaultFilters);
  const {
    data: bids,
    error,
    isPending,
  } = useFetchBids({
    currentPage,
    filters: appliedFilters,
    searchQuery: debouncedSearch,
  });

  const formattedData =
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    formatBidsData(bids?.data || [], tCommon as any, locale) ?? [];
  const tableData = formattedData.map((item) => ({
    [tableHeaders("id")]: item.id,
    [tableHeaders("type")]: item.type,
    [tableHeaders("date")]: item.date,
    [tableHeaders("moverName")]: item.moverName,
    [tableHeaders("price")]: item.price,
    [tableHeaders("status")]: item.status,
  }));

  const { cells: ordersCells, headers: ordersHeaders } =
    formatTableData(tableData);

  const { prefetchNext } = usePrefetchBids();

  useEffect(() => {
    if (bids && bids?.totalPages > currentPage) {
      prefetchNext(currentPage, 10, debouncedSearch, appliedFilters);
    }
  }, [currentPage, debouncedSearch, appliedFilters, prefetchNext, bids]);

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
    // setAppliedFilters(filters);
    // setCurrentPage(1);
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
    <div>
      <Table
        cells={ordersCells}
        headers={ordersHeaders}
        isLoading={isPending}
        title={t("title")}
        showFilter
        searchPlaceholder={t("searchPlaceholder")}
        query={searchInput}
        setQuery={setSearchInput}
        isFilterModalOpen={isFilterModalOpen}
        setIsFilterModalOpen={setIsFilterModalOpen}
        extraTableHeaders={[t("table.action")]}
        showPagination
        capitalizeColumns={[5]}
        extraTableColumnCells={(row, rowIndex) => (
          <BidTableCellButton
            key={`action-${rowIndex}`}
            row={row}
            rowIndex={rowIndex}
          />
        )}
        columnStyles={{
          5: (status) =>
            status === tCommon("status.approved")
              ? "bg-green-500/[0.2] text-green-700 p-1 rounded-lg flex justify-center "
              : status === tCommon("status.pending")
                ? "bg-yellow-500/[0.2] text-yellow-700  p-1 rounded-lg flex justify-center"
                : status === tCommon("status.rejected")
                  ? "bg-red-500/[0.2] text-red-700 p-1 rounded-lg flex justify-center"
                  : "",
        }}
        currentPage={currentPage}
        onPageChange={(page) => {
          setCurrentPage(page);
        }}
        totalItems={bids?.total ?? 0}
        itemsPerPage={10}
      />

      <Modal
        isOpen={isFilterModalOpen}
        onOpenChange={() => setIsFilterModalOpen(!isFilterModalOpen)}
      >
        <div className="flex flex-col ">
          <DialogTitle>{tCommon("labels.addFilter")}</DialogTitle>

          <div className="space-y-4 mt-4">
            <div className="flex flex-col px-4">
              {/* <div className="flex flex-row justify-between">
                <label className="text-[#707070]">Type</label>
                <button
                  onClick={() => clearFilterItem("orderType")}
                  className="text-red-500"
                >
                  Clear
                </button>
              </div> */}
              {/* <Dropdown
                items={quotationTypes}
                onselect={(value) => handleFilterSelect(value, "orderType")}
                value={filters.orderType}
              /> */}
            </div>

            <div className="flex flex-col px-4">
              <div className="flex flex-row justify-between">
                <label className="text-[#707070]">
                  {tCommon("labels.status")}
                </label>
                <button
                  onClick={() => clearFilterItem("orderStatus")}
                  className="text-red-500"
                >
                  Clear
                </button>
              </div>
              <Dropdown
                items={bidStatuses.map((type) => ({
                  ...type,
                  label: tCommon(`status.${type.label}`),
                }))}
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
                <label className="text-[#707070]">
                  {tCommon("labels.selectDate")}
                </label>
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
                  <label className="">{tCommon("labels.from")}</label>
                  <DatePicker
                    selectedDate={filters.startDate}
                    onDateChange={(date) => handleDateChange(date, "startDate")}
                  />
                </div>
                <div className="flex flex-col w-full">
                  <label className="">{tCommon("labels.to")}</label>
                  <DatePicker
                    selectedDate={filters.endDate}
                    onDateChange={(date) => handleDateChange(date, "endDate")}
                  />
                </div>
              </div>
            </div>

            <div className="flex justify-between px-4 mt-2">
              <Button onClick={resetFilters} variant={"outline"}>
                {tCommon("buttons.resetFilter")}
              </Button>
              <Button onClick={applyFilter} className="bg-black dark:bg-white">
                {tCommon("buttons.applyFilter")}
              </Button>
            </div>
          </div>
        </div>
      </Modal>
    </div>
  );
};

export default Bids;
