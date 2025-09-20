"use client";

import { ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useSupplierEarnings } from "@/hooks/supplier/useSupplierEarnings";
import { formatNumber } from "@/lib/formatNumber";
import { FullPageLoader } from "@/components/ui/loading/FullPageLoader";
import { useRouter } from "@/i18n/navigation";
import { useState } from "react";
import { formatDistanceToNow } from "date-fns";
import { useSupplierOrders } from "@/hooks/supplier/useSupplierOrders";
import { useLocale, useTranslations } from "next-intl";
import { formatDateLocale } from "@/lib/formatDateLocale";

export default function EarningsDashboard() {
  const t = useTranslations("supplier.earnings");
  const { data, isLoading } = useSupplierEarnings();
  const locale = useLocale();
  const earnings = data?.data;
  const { data: ordersData } = useSupplierOrders();
  const bids = ordersData?.data?.bids;
  // console.log("bids", bids);

  const router = useRouter();
  const [activeTab, setActiveTab] = useState("pending");

  // Filter orders based on status
  const filteredBids = bids?.filter((order) => {
    if (activeTab === "completed") {
      return order.order_status === "completed";
    }
    return order.order_status !== "completed";
  });

  if (isLoading) {
    return <FullPageLoader />;
  }

  return (
    <div className="max-w-4xl mx-auto bg-white min-h-screen p-4 sm:p-6">
      {/* Header */}
      <div className="flex items-center mb-4 sm:mb-6">
        <Button
          onClick={() => router.back()}
          variant="ghost"
          size="icon"
          className="mr-2"
        >
          <ArrowLeft className="h-6 w-6" />
        </Button>
        <h1 className="text-2xl font-semibold flex-1 text-center pr-8">
          {t("title")}
        </h1>
      </div>

      <p className="text-gray-600 text-center mb-6">{t("description")}</p>

      {/* Earnings Cards */}
      <div className="grid grid-cols-2 gap-4 mb-8">
        <Card className="bg-red-600 text-white p-4 sm:p-6 rounded-2xl">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 mb-2">
            <div className="text-xl">{t("total")}</div>
            {/* <Button
              variant="ghost"
              className="text-white p-0 h-auto hover:text-white/90 self-start sm:self-auto"
            >
              Last Month <ChevronDown className="h-4 w-4 ml-1" />
            </Button> */}
          </div>
          <div className="text-3xl sm:text-4xl font-bold mb-2">
            SEK{" "}
            {formatNumber(
              Number(earnings?.totalEarnings.completed || 0) +
                Number(earnings?.totalEarnings.pending || 0)
            )}
          </div>
          {/* <div className="inline-flex items-center text-sm bg-white/10 rounded-full px-3 py-1">
            <span className="text-green-300 mr-1">↑</span> 0.6% than last month
          </div> */}
        </Card>

        <div className="grid grid-cols-1 gap-4">
          <Card className="bg-red-600 text-white p-4 rounded-2xl">
            <div className="text-sm mb-2">{t("pendingPayments")}</div>
            <div className="text-2xl font-bold">
              SEK {formatNumber(Number(earnings?.totalEarnings.pending || 0))}
            </div>
          </Card>
          <Card className="bg-red-600 text-white p-4 rounded-2xl">
            <div className="text-sm mb-2">{t("availableBalance")}</div>
            <div className="text-2xl font-bold">
              SEK {formatNumber(Number(earnings?.totalEarnings.completed || 0))}
            </div>
          </Card>
        </div>
      </div>

      {/* Transactions Section */}
      <div className="mb-4 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
        <h2 className="text-xl font-bold">{t("transactionsActivity")}</h2>
        {/* <Button variant="outline" className="text-red-600 border-red-600">
          Earnings <ChevronDown className="h-4 w-4 ml-1" />
        </Button> */}
      </div>

      <Tabs
        defaultValue="pending"
        className="mb-6"
        onValueChange={setActiveTab}
      >
        <TabsList className="grid grid-cols-2 mb-4">
          <TabsTrigger
            value="pending"
            className="data-[state=active]:bg-red-600 data-[state=active]:text-white"
          >
            {t("status.pending")}
          </TabsTrigger>
          <TabsTrigger
            value="completed"
            className="data-[state=active]:bg-red-600 data-[state=active]:text-white"
          >
            {t("status.completed")}
          </TabsTrigger>
        </TabsList>
        <TabsContent value={activeTab}>
          <div className="space-y-4 mb-8 grid grid-cols-1 gap-4 md:grid-cols-2">
            {filteredBids?.map((order, index) => (
              <Card key={index} className="p-4 border-red-100">
                <div className="flex flex-col md:grid md:grid-cols-2 sm:flex-row sm:items-center justify-between gap-4">
                  <div className="flex items-center gap-3">
                    <div className="w-1 h-12 bg-orange-400 rounded-full" />
                    <div>
                      <div className="font-semibold ">ID: {order.order_id}</div>
                      <div className="text-gray-500 text-sm">
                        {order.order_status === "completed"
                          ? t("paymentCompleted")
                          : t("timeToComplete", {
                              time: formatDistanceToNow(
                                new Date(order.created_at)
                              ),
                            })}
                      </div>
                      <div className="text-gray-500 text-sm flex items-center gap-2">
                        <span className="inline-block">
                          {order.created_at &&
                            formatDateLocale(order.created_at, locale)}
                        </span>
                      </div>
                    </div>
                  </div>
                  <div className="text-right sm:min-w-[120px]">
                    <div className="font-bold">
                      SEK {formatNumber(order.final_price)}
                    </div>
                    <span
                      className={`inline-block px-3 py-1 rounded-full text-sm mt-2 ${
                        order.order_status === "completed"
                          ? "bg-green-100 text-green-600"
                          : "bg-orange-100 text-orange-600"
                      }`}
                    >
                      {order.order_status === "completed"
                        ? t("status.completed")
                        : t("status.pending")}
                    </span>
                  </div>
                  <Button
                    onClick={() =>
                      router.push(
                        `/supplier/request-withdrawal/${order.bid_id}`
                      )
                    }
                  >
                    {t("requestWithdrawal")}
                  </Button>
                </div>
              </Card>
            ))}
          </div>
        </TabsContent>
      </Tabs>

      {/* Transaction Items */}

      {/* Withdrawal Button */}
      {/* <Button
        onClick={() => router.push("/supplier/request-withdrawal")}
        className="w-full bg-red-600 hover:bg-red-700 text-white text-lg py-6"
      >
        Request Withdrawal
      </Button> */}
    </div>
  );
}
