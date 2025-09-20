"use client";

import React, { useEffect, useState } from "react";
import QuotationCard from "./QuotationCard";
import Table from "@/components/Table";
import { formatTableData } from "@/lib/formatTable";
import { Button } from "@/components/ui/button";
import { Modal } from "@/components/Modal";
import { DatePicker } from "@/components/DatePicker";
import Dropdown from "@/components/Dropdown";
import { DialogTitle } from "@/components/ui/dialog";
import { quotationStatuses, quotationTypes } from "@/data/test/filters";
import QuotationTableCellButton from "./QuotationTableCellButton";
import { useDebounce } from "@/hooks/useDebounce";
import { Input } from "@/components/ui/input";
import { formatQuotationsData } from "@/lib/formatQuotationsData";
import {
  useFetchQuotations,
  usePrefetchOrders,
} from "@/hooks/admin/useFetchQuotations";
import { useDashboardCounts } from "@/hooks/admin/useDashboardCounts";
import { useTranslations } from "next-intl";

export interface Filters {
  orderType: string;
  orderStatus: "awarded" | "open" | "";
  orderLocation: string;
  startDate: Date | undefined;
  endDate: Date | undefined;
  minPrice: number | undefined;
  maxPrice: number | undefined;
}

const defaultFilters: Filters = {
  orderType: "",
  orderStatus: "",
  orderLocation: "",
  startDate: undefined,
  endDate: undefined,
  minPrice: undefined,
  maxPrice: undefined,
};

const Page = () => {
  const t = useTranslations("admin.table.quotations");
  const tCommon = useTranslations("common");
  const [currentPage, setCurrentPage] = useState(1);
  const [searchInput, setSearchInput] = useState("");
  const debouncedSearch = useDebounce(searchInput);
  const [isFilterModalOpen, setIsFilterModalOpen] = useState(false);
  const [filters, setFilters] = useState<Filters>(defaultFilters);
  const [appliedFilters, setAppliedFilters] = useState<Filters>(defaultFilters);

  const { data: quotations, isLoading } = useFetchQuotations({
    currentPage,
    filters: appliedFilters,
    searchQuery: debouncedSearch,
  });

  const { data: dashboardCounts } = useDashboardCounts();

  const { prefetchNext } = usePrefetchOrders();
  const totalPages = quotations
    ? Math.ceil(quotations?.total / quotations?.limit)
    : 1;

  useEffect(() => {
    if (quotations && quotations.total > currentPage) {
      prefetchNext(currentPage, 5, debouncedSearch, appliedFilters);
    }
  }, [
    currentPage,
    debouncedSearch,
    appliedFilters,
    prefetchNext,
    quotations,
    totalPages,
  ]);

  // const { cells: quotationsCells, headers: quotationsHeaders } =
  //   formatTableData(offersData?.data ?? [], {
  //     headerMap: {
  //       moverName: "Mover Name",
  //     },
  //   });

  const { cells: quotationsCells, headers: quotationsHeaders } =
    formatTableData(formatQuotationsData(quotations?.data || []) ?? [], {
      headerMap: {
        // moverName: "Mover Name",
      },
    });

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
  };

  const handleDateChange = (
    date: Date | undefined,
    dateType: "startDate" | "endDate"
  ) => {
    setFilters({ ...filters, [dateType]: date });
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

  return (
    <div className="flex flex-1 flex-col px-4 min-h-screen py-4">
      <div className="grid grid-cols-3 gap-x-4 my-4">
        {dashboardCounts && (
          <>
            <QuotationCard
              focused={false}
              count={dashboardCounts?.quotationsAndBids?.total}
              description={"Total Orders"}
              breakdown={null}
              key={1}
            />
            <QuotationCard
              focused={true}
              count={dashboardCounts?.bids?.total}
              description={"Total Bids"}
              breakdown={{
                ...Object.fromEntries(
                  Object.entries(dashboardCounts.bids).filter(
                    ([key]) => key !== "total"
                  )
                ),
              }}
              key={2}
            />
            <QuotationCard
              focused={false}
              count={dashboardCounts?.quotations?.total}
              description={"Total Quotations"}
              breakdown={{
                ...Object.fromEntries(
                  Object.entries(dashboardCounts.quotations).filter(
                    ([key]) => key !== "total"
                  )
                ),
              }}
              key={3}
            />
          </>
        )}
      </div>
      <Table
        cells={quotationsCells}
        headers={quotationsHeaders}
        title={t("quotations")}
        showFilter
        searchPlaceholder={t("searchByLocation")}
        query={searchInput}
        setQuery={setSearchInput}
        isFilterModalOpen={isFilterModalOpen}
        setIsFilterModalOpen={setIsFilterModalOpen}
        isLoading={isLoading}
        extraTableHeaders={["Action"]}
        extraTableColumnCells={(row, rowIndex) => (
          <QuotationTableCellButton
            key={`action-${rowIndex}`}
            row={row}
            rowIndex={rowIndex}
          />
        )}
        currentPage={currentPage}
        onPageChange={(page) => setCurrentPage(page)}
        totalItems={quotations?.total ?? 0}
        itemsPerPage={10}
        showPagination
        columnStyles={{
          5: (status) =>
            status === "awarded"
              ? "bg-green-500/[0.2] text-green-700 p-1 rounded-lg flex justify-center "
              : status === "approved"
                ? "bg-green-500/[0.2] text-green-700 p-1 rounded-lg flex justify-center "
                : status === "open"
                  ? "bg-yellow-500/[0.2] text-yellow-700 p-1 rounded-lg flex justify-center"
                  : status === "rejected"
                    ? "bg-red-500/[0.2] text-red-700 p-1 rounded-lg flex justify-center"
                    : "",
        }}
      />
      <Modal
        isOpen={isFilterModalOpen}
        onOpenChange={() => setIsFilterModalOpen(!isFilterModalOpen)}
      >
        <div className="flex flex-col ">
          <DialogTitle>{t("addFilters")}</DialogTitle>

          <div className="space-y-4 mt-4">
            <div className="flex flex-col px-4">
              <div className="flex flex-row justify-between">
                <label className="text-[#707070]">{t("type")}</label>
                <button
                  onClick={() => clearFilterItem("orderType")}
                  className="text-red-500"
                >
                  {t("clear")}
                </button>
              </div>
              <Dropdown
                items={quotationTypes.map((type) => ({
                  ...type,
                  label: tCommon(`quotationTypes.${type.label}`),
                }))}
                onselect={(value) => handleFilterSelect(value, "orderType")}
                value={filters.orderType}
              />
            </div>

            <div className="flex flex-col px-4">
              <div className="flex flex-row justify-between">
                <label className="text-[#707070]">{t("status")}</label>
                <button
                  onClick={() => clearFilterItem("orderStatus")}
                  className="text-red-500"
                >
                  {t("clear")}
                </button>
              </div>
              <Dropdown
                items={quotationStatuses.map((type) => ({
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
              </div>
              <Dropdown
                items={bidLocations}
                onselect={(value) => handleFilterSelect(value, "orderLocation")}
                value={filters.orderLocation}
              />
            </div> */}

            <div className="flex flex-col px-4">
              <div className="flex flex-row justify-between">
                <label className="text-[#707070]">{t("priceRange")}</label>
                <button
                  onClick={() => {
                    setFilters({
                      ...filters,
                      minPrice: undefined,
                      maxPrice: undefined,
                    });
                  }}
                  className="text-red-500"
                >
                  {t("clear")}
                </button>
              </div>
              <div className="flex justify-between mt-1 gap-x-8">
                <div className="flex-col flex w-full">
                  <label className="">{t("min")}</label>
                  <Input
                    type="number"
                    value={filters.minPrice}
                    onChange={(e) =>
                      setFilters({
                        ...filters,
                        minPrice: Number(e.target.value),
                      })
                    }
                  />
                </div>
                <div className="flex flex-col w-full">
                  <label className="">{t("max")}</label>
                  <Input
                    type="number"
                    value={filters.maxPrice}
                    onChange={(e) =>
                      setFilters({
                        ...filters,
                        maxPrice: Number(e.target.value),
                      })
                    }
                  />
                </div>
              </div>
            </div>

            <div className="flex flex-col px-4">
              <div className="flex flex-row justify-between">
                <label className="text-[#707070]">{t("selectDate")}</label>
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
                  {t("clear")}
                </button>
              </div>
              <div className="flex justify-between mt-1 gap-x-8">
                <div className="flex-col flex w-full">
                  <label className="">{t("from")}</label>
                  <DatePicker
                    selectedDate={filters.startDate}
                    onDateChange={(date) => handleDateChange(date, "startDate")}
                  />
                </div>
                <div className="flex flex-col w-full">
                  <label className="">{t("to")}</label>
                  <DatePicker
                    selectedDate={filters.endDate}
                    onDateChange={(date) => handleDateChange(date, "endDate")}
                  />
                </div>
              </div>
            </div>

            <div className="flex justify-between px-4 mt-2">
              <Button onClick={resetFilters} variant={"outline"}>
                {t("reset")}
              </Button>
              <Button onClick={applyFilter} className="bg-black dark:bg-white">
                {t("applyNow")}
              </Button>
            </div>
          </div>
        </div>
      </Modal>
    </div>
  );
};

export default Page;
