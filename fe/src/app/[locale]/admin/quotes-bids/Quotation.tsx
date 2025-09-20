import { DatePicker } from "@/components/DatePicker";
import Dropdown from "@/components/Dropdown";
import { Modal } from "@/components/Modal";
import Table from "@/components/Table";
import { Button } from "@/components/ui/button";
import { DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { usePrefetchOrders } from "@/hooks/admin/useFetchQuotations";
import { useDebounce } from "@/hooks/useDebounce";
import { useFetchQuotations } from "@/hooks/admin/useFetchQuotations";
import React, { useEffect, useState } from "react";
import { formatTableData } from "@/lib/formatTable";
import { formatQuotationsData } from "@/lib/formatQuotationsData";
import QuotationTableCellButton from "./QuotationTableCellButton";
import { quotationStatuses, quotationTypes } from "@/data/test/filters";
import { useTranslations, useLocale } from "next-intl";

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

const Quotation = () => {
  const t = useTranslations("admin.quotations");
  const tableHeaders = useTranslations("admin.tableHeaders");
  const tCommon = useTranslations("common");
  const locale = useLocale();
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

  const formattedData = formatQuotationsData(
    quotations?.data || [],
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    tCommon as any,
    locale
  );
  const tableData = formattedData.map((item) => ({
    [tableHeaders("id")]: item.id,
    [tableHeaders("type")]: item.type,
    [tableHeaders("date")]: item.date,
    [tableHeaders("moveDate")]: item.moveDate,
    [tableHeaders("location")]: item.location,
    [tableHeaders("status")]: item.status,
  }));

  const { cells: quotationsCells, headers: quotationsHeaders } =
    formatTableData(tableData);

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
    <div>
      <Table
        cells={quotationsCells}
        headers={quotationsHeaders}
        title={t("title")}
        showFilter
        searchPlaceholder={t("searchPlaceholder")}
        query={searchInput}
        setQuery={setSearchInput}
        isFilterModalOpen={isFilterModalOpen}
        setIsFilterModalOpen={setIsFilterModalOpen}
        isLoading={isLoading}
        extraTableHeaders={[tableHeaders("action")]}
        capitalizeColumns={[5]}
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
            status === tCommon("status.awarded")
              ? "bg-green-500/[0.2] text-green-700 p-1 rounded-lg flex justify-center "
              : status === tCommon("status.approved")
                ? "bg-green-500/[0.2] text-green-700 p-1 rounded-lg flex justify-center "
                : status === tCommon("status.open")
                  ? "bg-yellow-500/[0.2] text-yellow-700 p-1 rounded-lg flex justify-center"
                  : status === tCommon("status.rejected")
                    ? "bg-red-500/[0.2] text-red-700 p-1 rounded-lg flex justify-center"
                    : "",
        }}
      />
      <Modal
        isOpen={isFilterModalOpen}
        onOpenChange={() => setIsFilterModalOpen(!isFilterModalOpen)}
      >
        <div className="flex flex-col ">
          <DialogTitle>{tCommon("labels.addFilter")}</DialogTitle>

          <div className="space-y-4 mt-4">
            <div className="flex flex-col px-4">
              <div className="flex flex-row justify-between">
                <label className="text-[#707070]">
                  {tCommon("labels.type")}
                </label>
                <button
                  onClick={() => clearFilterItem("orderType")}
                  className="text-red-500"
                >
                  {tCommon("buttons.clearFilter")}
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
                <label className="text-[#707070]">
                  {tCommon("labels.status")}
                </label>
                <button
                  onClick={() => clearFilterItem("orderStatus")}
                  className="text-red-500"
                >
                  {tCommon("buttons.clearFilter")}
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
                <label className="text-[#707070]">
                  {tCommon("labels.priceRange")}
                </label>
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
                  {tCommon("buttons.clearFilter")}
                </button>
              </div>
              <div className="flex justify-between mt-1 gap-x-8">
                <div className="flex-col flex w-full">
                  <label className="">{tCommon("labels.minSek")}</label>
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
                  <label className="">{tCommon("labels.maxSek")}</label>
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
                  {tCommon("buttons.clearFilter")}
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

export default Quotation;
