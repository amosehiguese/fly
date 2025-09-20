import {
  TableCell,
  Table as Table1,
  TableBody,
  TableHead,
  TableHeader,
  TableRow,
} from "./ui/table";
import { Card, CardContent, CardHeader, CardTitle } from "./ui/card";
import { SetStateAction } from "react";
import { Input } from "./ui/input";
import { Button } from "./ui/button";
import { Download, Search, SlidersHorizontal } from "lucide-react";
import {
  Pagination,
  PaginationEllipsis,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "./ui/pagination";
import { PaginationContent } from "./ui/pagination";
import { TableSkeleton } from "./TableSkeleton";
import { capitalizeWords } from "@/lib/capitalizeWords";
import { useTranslations } from "next-intl";

interface TableProps {
  title: string;
  headers: string[];
  isLoading?: boolean;
  cells: string[][];
  extraTableHeaders?: string[];
  extraTableColumnCells?: (row: string[], rowIndex: number) => React.ReactNode;
  capitalizeColumns?: number[];
  showFilter?: boolean;
  isFilterModalOpen?: boolean;
  setIsFilterModalOpen?: (value: React.SetStateAction<boolean>) => void;
  filters?: Record<string, string | number | boolean>; // or whatever filter structure you need
  setFilters?: (
    value: React.SetStateAction<Record<string, string | number | boolean>>
  ) => void;
  searchPlaceholder?: string;
  query?: string;
  setQuery?: (value: React.SetStateAction<string>) => void;
  // Add new prop for column styles
  columnStyles?: {
    [columnIndex: number]: (content: string) => string;
  };
  itemsPerPage?: number;
  currentPage?: number;
  setCurrentPage?: (value: React.SetStateAction<number>) => void;
  onPageChange?: (page: number) => void;
  totalItems?: number;
  showPagination?: boolean;
  showDownload?: boolean;
  handleDownload?: () => void;
  downloadFileName?: string;
  error?: boolean;
}

const Table = ({
  title,
  headers,
  isLoading,
  cells,
  capitalizeColumns = [],
  extraTableColumnCells,
  extraTableHeaders = [],
  showFilter = false,
  searchPlaceholder = "",
  query,
  setQuery,
  isFilterModalOpen = false,
  setIsFilterModalOpen,
  columnStyles = {},
  itemsPerPage = 10,
  currentPage = 1,
  onPageChange,
  totalItems,
  showPagination = false,
  showDownload = false,
  handleDownload,
  error = false,
}: TableProps) => {
  const tCommon = useTranslations("common");
  const totalPages = totalItems
    ? Math.ceil(totalItems / itemsPerPage)
    : Math.ceil(cells.length / itemsPerPage);
  // const startIndex = (currentPage - 1) * itemsPerPage;
  // const endIndex = Math.min(startIndex + itemsPerPage, cells.length);
  // const paginatedCells = cells.slice(startIndex, endIndex);

  const getPageNumbers = () => {
    const pages = [];
    const maxVisiblePages = 5;

    if (totalPages <= maxVisiblePages) {
      for (let i = 1; i <= totalPages; i++) {
        pages.push(i);
      }
    } else {
      if (currentPage <= 3) {
        for (let i = 1; i <= 4; i++) {
          pages.push(i);
        }
        pages.push(null); // ellipsis
        pages.push(totalPages);
      } else if (currentPage >= totalPages - 2) {
        pages.push(1);
        pages.push(null); // ellipsis
        for (let i = totalPages - 3; i <= totalPages; i++) {
          pages.push(i);
        }
      } else {
        pages.push(1);
        pages.push(null); // ellipsis
        pages.push(currentPage - 1);
        pages.push(currentPage);
        pages.push(currentPage + 1);
        pages.push(null); // ellipsis
        pages.push(totalPages);
      }
    }
    return pages;
  };

  return (
    <Card className="">
      <CardHeader>
        <CardTitle className="flex flex-col md:flex-row justify-between  md:items-center">
          {title}
          {showFilter && (
            <div className="flex flex-col items-start md:flex-row md:items-center mt-2 md:mt-0 gap-x-2">
              <div className="flex w-full border rounded-[6px] px-2 max-w-sm  items-center ">
                <Search size={16} />
                <Input
                  placeholder={searchPlaceholder}
                  onChange={(e) => setQuery && setQuery(e.target.value)}
                  value={query}
                  className="border-none  focus-visible:ring-0"
                />
              </div>

              <div className="flex md:w-auto w-full gap-2 mt-2 md:mt-0">
                <Button
                  variant={"outline"}
                  onClick={() =>
                    setIsFilterModalOpen &&
                    setIsFilterModalOpen(!isFilterModalOpen)
                  }
                >
                  <SlidersHorizontal />
                  <div>{tCommon("buttons.addFilter")}</div>
                </Button>

                {/* <Button variant={"outline"}>
                  <Download />
                </Button> */}
              </div>
            </div>
          )}
          {showDownload && (
            <Button
              variant={"outline"}
              onClick={handleDownload}
              disabled={isLoading || cells.length === 0}
            >
              <Download className="mr-2 h-4 w-4" />
              <span>{tCommon("buttons.download")}</span>
            </Button>
          )}
        </CardTitle>
      </CardHeader>
      <CardContent>
        <Table1>
          <TableHeader>
            <TableRow>
              {headers.map((item, index) => (
                <TableHead
                  className="text-black dark:text-white min-w-28 font-bold"
                  key={`header-${index}`}
                >
                  {item}
                </TableHead>
              ))}
              {extraTableHeaders.map((item, index) => (
                <TableHead
                  className="text-black dark:text-white font-bold"
                  key={`extra-header-${index}`}
                >
                  {item}
                </TableHead>
              ))}
            </TableRow>
          </TableHeader>
          <TableBody>
            {cells.map((row, rowIndex) => (
              <TableRow
                className="text-subtitle font-normal dark:text-white"
                key={`row-${rowIndex}`}
              >
                {row.map((cell, cellIndex) => (
                  <TableCell key={`cell-${rowIndex}-${cellIndex}`}>
                    <div
                      className={
                        columnStyles[cellIndex]
                          ? columnStyles[cellIndex](cell)
                          : undefined
                      }
                    >
                      {capitalizeColumns.includes(cellIndex)
                        ? capitalizeWords(cell)
                        : cell}
                    </div>
                  </TableCell>
                ))}
                {extraTableHeaders.length > 0 &&
                  extraTableColumnCells &&
                  extraTableColumnCells(row, rowIndex)}
              </TableRow>
            ))}
          </TableBody>
        </Table1>

        {isLoading && <TableSkeleton rows={10} columns={6} />}
        {error && (
          <div className="flex h-[200px] items-center justify-center">
            <p className="text-red-500">{tCommon("table.error")}</p>
          </div>
        )}

        {cells.length === 0 && !isLoading && !error && (
          <div className="flex flex-col items-center justify-center py-12 text-gray-500">
            <div className="mb-4 text-center">{tCommon("table.noData")}</div>
            <svg
              width="120"
              height="120"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="1"
              strokeLinecap="round"
              strokeLinejoin="round"
              className="text-gray-300"
            >
              <rect x="2" y="3" width="20" height="18" rx="2" ry="2"></rect>
              <line x1="2" y1="8" x2="22" y2="8"></line>
              <line x1="7" y1="3" x2="7" y2="8"></line>
              <line x1="17" y1="3" x2="17" y2="8"></line>
              <line x1="6" y1="14" x2="18" y2="14" strokeDasharray="2"></line>
              <line x1="6" y1="18" x2="18" y2="18" strokeDasharray="2"></line>
            </svg>
          </div>
        )}

        {showPagination && (
          <div className="mt-4">
            <Pagination>
              <PaginationContent>
                <PaginationItem>
                  <PaginationPrevious
                    title="asd"
                    onClick={() => onPageChange?.(currentPage - 1)}
                    className={
                      currentPage === 1
                        ? "pointer-events-none opacity-50"
                        : "cursor-pointer"
                    }
                  />
                </PaginationItem>

                {getPageNumbers().map((pageNum, index) => (
                  <PaginationItem key={index}>
                    {pageNum === null ? (
                      <PaginationEllipsis />
                    ) : (
                      <PaginationLink
                        onClick={() => onPageChange?.(pageNum)}
                        isActive={pageNum === currentPage}
                        className="cursor-pointer"
                      >
                        {pageNum}
                      </PaginationLink>
                    )}
                  </PaginationItem>
                ))}

                <PaginationItem>
                  <PaginationNext
                    onClick={() => onPageChange?.(currentPage + 1)}
                    className={
                      currentPage === totalPages
                        ? "pointer-events-none opacity-50"
                        : "cursor-pointer"
                    }
                  />
                </PaginationItem>
              </PaginationContent>
            </Pagination>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default Table;
