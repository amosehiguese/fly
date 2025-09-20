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
import ClientTableCellButton from "./OrderTableCellButton";
import {
  useFetchOrders,
  usePrefetchOrders,
} from "@/hooks/admin/useFetchOrders";
import { formatOrdersData } from "@/lib/formatOrdersData";
import { useTranslations } from "next-intl";
import { useLocale } from "next-intl";
export interface OrderFilters {
  quotationType: string;
  orderStatus: "accepted" | "pending" | "rejected" | "";
  // orderLocation: string;
  date: Date | undefined;
  // endDate: Date | undefined;
}

const defaultFilters: OrderFilters = {
  quotationType: "",
  orderStatus: "",
  // orderLocation: "",
  date: undefined,
  // endDate: undefined,
};

const Page = () => {
  const t = useTranslations("admin.orders");
  const tCommon = useTranslations("common");
  const tableHeaders = useTranslations("admin.tableHeaders");
  const locale = useLocale();
  const [currentPage, setCurrentPage] = useState(1);
  const [searchInput, setSearchInput] = useState("");
  const debouncedSearch = useDebounce(searchInput);
  const [isFilterModalOpen, setIsFilterModalOpen] = useState(false);
  const [filters, setFilters] = useState<OrderFilters>(defaultFilters);
  const [appliedFilters, setAppliedFilters] =
    useState<OrderFilters>(defaultFilters);
  const {
    data: orders,
    error,
    isPending,
  } = useFetchOrders({
    currentPage,
    filters: appliedFilters,
    searchQuery: debouncedSearch,
  });

  const formattedData =
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    formatOrdersData(orders?.data || [], tCommon as any, locale) ?? [];
  const tableData = formattedData.map((item) => ({
    [tableHeaders("orderId")]: item.orderId,
    // [tableHeaders("customer")]: item.customer,
    [tableHeaders("type")]: item.type,
    [tableHeaders("date")]: item.date,
    [tableHeaders("moverName")]: item.moverName,
    [tableHeaders("location")]: item.location,
    [tableHeaders("total")]: item.total,
    [tableHeaders("status")]: item.status,
    [tableHeaders("paymentStatus")]: item.paymentStatus,
  }));

  const { cells: ordersCells, headers: ordersHeaders } =
    formatTableData(tableData);

  const { prefetchNext } = usePrefetchOrders();

  useEffect(() => {
    if (orders && orders?.pagination?.totalPages > currentPage) {
      prefetchNext(currentPage, 10, debouncedSearch, appliedFilters);
    }
  }, [currentPage, debouncedSearch, appliedFilters, prefetchNext, orders]);

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
    date: Date | undefined
    // dateType: "startDate" | "endDate"
  ) => {
    setFilters({ ...filters, date });
  };

  if (error) {
    return <div>{t("error", { message: (error as Error).message })}</div>;
  }

  return (
    <div className="px-2 w-full">
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
        capitalizeColumns={[2, 8, 9]}
        extraTableColumnCells={(row, rowIndex) => (
          <ClientTableCellButton
            key={`action-${rowIndex}`}
            row={row}
            rowIndex={rowIndex}
          />
        )}
        columnStyles={{
          5: () => "min-w-[300px]",
          7: (status) =>
            status === t("status.accepted") //supposed to be completed
              ? "bg-green-500/[0.2] text-green-700 p-2 rounded-lg flex justify-center capitalize"
              : status === t("status.pending") // supposed to be accepted
                ? "bg-yellow-500/[0.2] text-yellow-700 p-2 rounded-lg flex justify-center capitalize"
                : status === t("status.rejected") //supposed to be failed
                  ? "bg-red-500/[0.2] text-red-700 p-2 rounded-lg flex justify-center capitalize"
                  : "",
        }}
        currentPage={currentPage}
        onPageChange={(page) => {
          setCurrentPage(page);
        }}
        totalItems={orders?.pagination?.totalOrders ?? 0}
        itemsPerPage={10}
      />

      <Modal
        isOpen={isFilterModalOpen}
        onOpenChange={() => setIsFilterModalOpen(!isFilterModalOpen)}
      >
        <div className="flex flex-col">
          <DialogTitle>{t("filters.title")}</DialogTitle>

          <div className="space-y-4 mt-4">
            <div className="flex flex-col px-4">
              <div className="flex flex-row justify-between">
                <label className="text-[#707070]">
                  {t("filters.type.label")}
                </label>
                <button
                  onClick={() => clearFilterItem("quotationType")}
                  className="text-red-500"
                >
                  {t("filters.type.clear")}
                </button>
              </div>
              <Dropdown
                items={quotationTypes.map((type) => ({
                  ...type,
                  label: tCommon(`quotationTypes.${type.label}`),
                }))}
                onselect={(value) => handleFilterSelect(value, "quotationType")}
                value={filters.quotationType}
              />
            </div>

            <div className="flex flex-col px-4">
              <div className="flex flex-row justify-between">
                <label className="text-[#707070]">
                  {t("filters.status.label")}
                </label>
                <button
                  onClick={() => clearFilterItem("orderStatus")}
                  className="text-red-500"
                >
                  {t("filters.status.clear")}
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
                  {t("filters.date.label")}
                </label>
                <button
                  onClick={() => handleDateChange(undefined)}
                  className="text-red-500"
                >
                  {t("filters.date.clear")}
                </button>
              </div>
              <DatePicker
                selectedDate={filters.date}
                onDateChange={handleDateChange}
                buttonClassName="w-full"
              />
            </div>

            <div className="flex justify-between px-4 mt-4">
              <Button onClick={resetFilters} variant="outline">
                {t("filters.reset")}
              </Button>
              <Button onClick={applyFilter}>{t("filters.apply")}</Button>
            </div>
          </div>
        </div>
      </Modal>
    </div>
  );
};

export default Page;
