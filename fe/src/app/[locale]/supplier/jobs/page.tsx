"use client";

import { Suspense } from "react";
import { useRouter } from "@/i18n/navigation";
import { useSearchParams } from "next/navigation";
import { TabGroup } from "@/components/supplier/TabGroup";
import { DisputeCard } from "@/components/supplier/DisputeCard";
import {
  AlertCircle,
  ArrowLeft,
  CheckCircle,
  Clock,
  SearchX,
} from "lucide-react";
import { useSupplierDashboard } from "@/hooks/supplier/useSupplierDashboard";
import { Marketplace } from "@/components/supplier/Marketplace";
import { OrderCard } from "@/components/supplier/OrderCard";
import { FullPageLoader } from "@/components/ui/loading/FullPageLoader";
import { useSupplierDisputes } from "@/hooks/supplier/useSupplierDisputes";
import { Order } from "@/api/interfaces/suppliers";
import { useSupplierOrders } from "@/hooks/supplier/useSupplierOrders";
import { OngoingOrderCard } from "@/components/supplier/OngoingOrderCard";
import { useTranslations } from "next-intl";

// const tabs = [
//   { label: "New Quotations", value: "new" },
//   { label: "Ongoing", value: "ongoing" },
//   { label: "Completed", value: "completed" },
//   { label: "Disputes", value: "dispute" },
// ];

// Separate component that uses useSearchParams
function JobsContent() {
  const t = useTranslations("supplier.jobs");
  const searchParams = useSearchParams();
  const router = useRouter();

  // Update tabs with translations
  const translatedTabs = [
    { label: t("tabs.newQuotations"), value: "new" },
    { label: t("tabs.ongoing"), value: "ongoing" },
    { label: t("tabs.completed"), value: "completed" },
    { label: t("tabs.disputes"), value: "dispute" },
  ];

  // Get activeTab directly from URL, with fallback to "new"
  const activeTab = searchParams.get("tab") || "new";

  const {
    data: dashboardData,
    isPending: jobsLoading,
    error: jobsError,
  } = useSupplierDashboard();

  // console.log("len ", dashboardData?.orders?.length);

  const { data: disputes } = useSupplierDisputes();
  const { data: ordersData } = useSupplierOrders();

  // const orders = dashboardData?.orders;
  const orders = ordersData?.data?.bids;

  // console.log("myOrders", myOrders);
  console.log("orders", orders);

  // const disputes = dashboardData?.data?.disputes;

  const EmptyState = ({
    message,
    icon,
  }: {
    message: string;
    icon?: React.ReactNode;
  }) => (
    <div className="flex flex-col items-center justify-center w-full py-16 mt-4 bg-white rounded-lg shadow-sm">
      <div className="mb-4 p-4 rounded-full bg-gray-100">
        {icon || <SearchX className="h-8 w-8 text-gray-400" />}
      </div>
      <h3 className="text-lg font-medium text-gray-900 mb-1">
        {t("emptyStates.noItems")}
      </h3>
      <p className="text-gray-500 text-center max-w-md">{message}</p>
    </div>
  );

  const renderContent = () => {
    // if (!dashboardData?.data) return null;

    switch (activeTab) {
      case "new":
        return <Marketplace />;
      case "ongoing":
        return (
          <div className="grid gap-4 md:grid-cols-2">
            {jobsLoading ? (
              <div className="flex flex-1 w-full">
                <FullPageLoader />
              </div>
            ) : jobsError ? (
              <div className="flex h-[200px] items-center justify-center">
                <p className="text-red-500">
                  {t("error", { message: (jobsError as Error)?.message })}
                </p>
              </div>
            ) : orders?.filter((order: Order) =>
                ["pending", "ongoing", "accepted"].includes(order.order_status)
              ).length === 0 ? (
              <EmptyState
                message={t("emptyStates.ongoing")}
                icon={<Clock className="h-8 w-8 text-gray-400" />}
              />
            ) : (
              orders
                ?.filter((order: Order) =>
                  ["pending", "ongoing", "accepted"].includes(
                    order.order_status
                  )
                )
                .sort(
                  (a: Order, b: Order) =>
                    new Date(b.created_at).getTime() -
                    new Date(a.created_at).getTime()
                )
                .map((order: Order, index: number) => (
                  <OngoingOrderCard key={index} order={order} />
                ))
            )}
          </div>
        );
      case "completed":
        return (
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {jobsLoading ? (
              <div className="flex flex-1 w-full">
                <FullPageLoader />
              </div>
            ) : jobsError ? (
              <div className="flex h-[200px] items-center justify-center">
                <p className="text-red-500">
                  {t("error", { message: (jobsError as Error)?.message })}
                </p>
              </div>
            ) : orders?.filter(
                (order: Order) => order.order_status === "delivered"
              ).length === 0 ? (
              <EmptyState
                message={t("emptyStates.completed")}
                icon={<CheckCircle className="h-8 w-8 text-gray-400" />}
              />
            ) : (
              orders
                ?.filter((order: Order) => order.order_status === "delivered")
                .map((order: Order) => (
                  <OrderCard
                    key={order.order_id}
                    order={order}
                    showStatus={false}
                  />
                ))
            )}
          </div>
        );
      case "dispute":
        return (
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3 mt-4">
            {!disputes?.disputes || disputes.disputes.length === 0 ? (
              <EmptyState
                message={t("emptyStates.disputes")}
                icon={<AlertCircle className="h-8 w-8 text-gray-400" />}
              />
            ) : (
              disputes?.disputes?.map((dispute) => (
                <DisputeCard
                  key={dispute.dispute_id}
                  dispute={{
                    dispute_id: Number(dispute.dispute_id),
                    status: dispute.dispute_status as
                      | "pending"
                      | "resolved"
                      | "in-review",
                    reason: dispute.reason,
                    updated_at: null,
                  }}
                />
              ))
            )}
          </div>
        );
      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex flex-col items-start justify-between gap-4 ">
          <div className="w-full">
            <div className="flex justify-between items-center">
              <button onClick={() => router.back()}>
                <ArrowLeft className="w-7 h-7" />
              </button>
              <h1 className="text-2xl font-bold text-center mb-2">
                {t("title")}
              </h1>
              <div />
            </div>
            <p className="text-sm text-center text-gray-500">
              {t("description")}
            </p>
          </div>
          <TabGroup
            tabs={translatedTabs}
            activeTab={activeTab}
            className="w-full lg:w-auto"
            onTabChange={(tabValue) => {
              router.push(`/supplier/jobs?tab=${tabValue}`);
            }}
          />
        </div>

        {renderContent()}
      </div>
    </div>
  );
}

// Main component with Suspense boundary
export default function Jobs() {
  const t = useTranslations("supplier.jobs");
  return (
    <Suspense fallback={<div>{t("loading")}</div>}>
      <JobsContent />
    </Suspense>
  );
}
