"use client";

import React, { useEffect } from "react";
import { useSupplierDashboard, useSupplierMarketplace } from "@/hooks/supplier";
import { useInView } from "react-intersection-observer";
import { JobCard } from "./JobCard";
import { capitalizeWords } from "@/lib/capitalizeWords";
import { FullPageLoader } from "../ui/loading/FullPageLoader";
import { useTranslations } from "next-intl";

import { MarketplaceFilters } from "@/api/interfaces/suppliers";
import { SearchX } from "lucide-react";

export const Marketplace: React.FC = () => {
  const t = useTranslations("supplier");
  const { ref, inView } = useInView();

  const [filters] = React.useState<Omit<MarketplaceFilters, "page">>({
    from_city: "",
    to_city: "",
    move_date: "",
    type_of_service: "",
  });

  const {
    data,
    isLoading,
    isError,
    error,
    hasNextPage,
    fetchNextPage,
    isFetchingNextPage,
  } = useSupplierMarketplace(filters);
  const { data: supplierDashboard } = useSupplierDashboard();
  const supplierId = supplierDashboard?.data.supplier_id;

  const availableJobs = data?.pages[0].marketplace.filter(
    (item) => !item.bids.some((bid) => bid.supplier_id === supplierId)
  );
  console.log(
    "available jobs",
    availableJobs,
    availableJobs?.length,
    supplierId
  );

  useEffect(() => {
    if (inView && hasNextPage) {
      fetchNextPage();
    }
  }, [inView, hasNextPage, fetchNextPage]);

  if (isLoading) return <FullPageLoader />;
  if (isError)
    return <div>{t("marketplace.error", { message: error?.message })}</div>;

  if (data?.pages.length === 0)
    return (
      <div className="flex flex-col items-center justify-center w-full py-16 mt-4 bg-white rounded-lg shadow-sm">
        <div className="mb-4 p-4 rounded-full bg-gray-100">
          <SearchX className="h-8 w-8 text-gray-400" />
        </div>
        <h3 className="text-lg font-medium text-gray-900 mb-1">
          {t("jobs.emptyStates.noItems")}
        </h3>
        <p className="text-gray-500 text-center max-w-md">
          {t("jobs.emptyStates.noNewOrders")}
        </p>
      </div>
    );

  return (
    <div className="space-y-4">
      {/* Filters */}
      {/* <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <input
          type="text"
          placeholder="From City"
          value={filters.from_city}
          onChange={(e) =>
            setFilters((prev) => ({ ...prev, from_city: e.target.value }))
          }
          className="input input-bordered w-full"
        />
        <input
          type="text"
          placeholder="To City"
          value={filters.to_city}
          onChange={(e) =>
            setFilters((prev) => ({ ...prev, to_city: e.target.value }))
          }
          className="input input-bordered w-full"
        />
        <input
          type="date"
          value={filters.move_date}
          onChange={(e) =>
            setFilters((prev) => ({ ...prev, move_date: e.target.value }))
          }
          className="input input-bordered w-full"
        />
        <select
          value={filters.type_of_service}
          onChange={(e) =>
            setFilters((prev) => ({ ...prev, type_of_service: e.target.value }))
          }
          className="select select-bordered w-full"
        >
          <option value="">All Services</option>
          <option value="local_move">Local Move</option>
          <option value="storage">Storage</option>
          <option value="move_out_cleaning">Move-Out Cleaning</option>
          <option value="heavy_lifting">Heavy Lifting</option>
          <option value="company_relocation">Company Relocation</option>
        </select>
      </div> */}

      {/* Marketplace Items */}
      <div className="grid md:grid-cols-2 gap-4">
        {data?.pages.map((page, i) => (
          <React.Fragment key={i}>
            {page.marketplace
              .filter((item) => {
                // Get the supplier's ID from the dashboard data

                // Only show items where the supplier hasn't already placed a bid
                return !item.bids.some(
                  (bid) => bid.supplier_id.toString() === supplierId?.toString()
                );
              })
              .map((item, index) => (
                <JobCard
                  key={index}
                  job={{
                    id: item.quotation.id.toString(),
                    status: item.quotation.status as
                      | "pending"
                      | "completed"
                      | "available"
                      | "in-transit",
                    pickup: {
                      city: "",
                      address: item.quotation.pickup_address,
                    },
                    delivery: {
                      city: "",
                      address: item.quotation.delivery_address,
                    },
                    moveType: capitalizeWords(item.quotation.table_name),
                    distance: t("jobs.details.distance"),
                    hasFragileItems: false,
                  }}
                />
              ))}
          </React.Fragment>
        ))}
      </div>

      {/* Load More Trigger */}
      <div ref={ref} className="h-10 flex items-center justify-center">
        {isFetchingNextPage
          ? t("marketplace.loadMore.loading")
          : hasNextPage
            ? t("marketplace.loadMore.loadMore")
            : t("marketplace.loadMore.noMore")}
      </div>
    </div>
  );
};

export default Marketplace;
