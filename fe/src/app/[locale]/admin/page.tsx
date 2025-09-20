"use client";

import { fetchMonthlyIncome, fetchRecentAcitivities } from "@/api/admin";
import { DasboardAreaChart } from "@/components/DashboardAreaChart";
import DashboardCard from "@/components/DashboardCard";
import Table from "@/components/Table";
import { useDashboardCounts } from "@/hooks/admin/useDashboardCounts";
import { useFetchOrders } from "@/hooks/admin/useFetchOrders";
import { formatOrdersData } from "@/lib/formatOrdersData";
import { formatRecentActivities } from "@/lib/formatRecentActivities";
import { formatTableData } from "@/lib/formatTable";
import { mapChartData } from "@/lib/mapChartData";
import { useQuery } from "@tanstack/react-query";
import { useLocale, useTranslations } from "next-intl";
import { TFunction } from "i18next";
import Link from "next/link";
// import { getAllKeys } from "@/lib/getAllKeys";

const Page = () => {
  const t = useTranslations("admin.dashboard");
  const tableHeaders = useTranslations("admin.tableHeaders");
  const commonT = useTranslations("common");
  const locale = useLocale();

  const { data: dashboardCounts } = useDashboardCounts();
  const { data: recentActivities } = useQuery({
    queryKey: ["recent-activities"],
    queryFn: fetchRecentAcitivities,
  });
  const { data: orders, isPending } = useFetchOrders({
    currentPage: 1,
    filters: { date: undefined, orderStatus: "", quotationType: "" },
    searchQuery: "",
  });
  const count = [
    {
      description: t("cards.totalOrders"),
      percentageIncrease: 12,
      count: dashboardCounts?.quotationsAndBids.total,
      id: 1,
      link: "/admin/orders",
    },
    {
      description: t("cards.totalBids"),
      percentageIncrease: 12,
      count: dashboardCounts?.bids.total,
      id: 2,
      link: "/admin/quotes-bids?focused=bids",
    },
    {
      description: t("cards.totalQuotations"),
      percentageIncrease: 12,
      count: dashboardCounts?.quotations.total,
      id: 3,
      link: "/admin/quotes-bids?focused=quotes",
    },
    {
      description: t("cards.totalDisputes"),
      percentageIncrease: 12,
      count: dashboardCounts?.conversations.total,
      id: 4,
      link: "/admin/disputes",
    },
  ];

  const formattedOrdersData =
    formatOrdersData(
      orders?.data || [],
      commonT as unknown as TFunction,
      locale
    ) ?? [];
  const ordersTableData = formattedOrdersData.map((item) => ({
    [tableHeaders("id")]: item.orderId,
    // [tableHeaders("customer")]: item.customer,
    [tableHeaders("type")]: item.type,
    [tableHeaders("date")]: item.date,
    [tableHeaders("moverName")]: item.moverName,
    [tableHeaders("location")]: item.location,
    [tableHeaders("total")]: item.total,
    [tableHeaders("status")]: item.status,
    [tableHeaders("paymentStatus")]: item.paymentStatus,
  }));

  const formattedActivitiesData =
    formatRecentActivities(recentActivities || [], locale) ?? [];
  const activitiesTableData = formattedActivitiesData.map((item) => ({
    [tableHeaders("id")]: item.id,
    [tableHeaders("title")]: item.title,
    [tableHeaders("message")]: item.message,
    [tableHeaders("date")]: item.date,
    [tableHeaders("type")]: item.type,
  }));

  const { cells: ordersCells, headers: ordersHeaders } =
    formatTableData(ordersTableData);
  const { cells: activityCells, headers: activityHeaders } =
    formatTableData(activitiesTableData);

  const { data: monthlyIncome } = useQuery({
    queryKey: ["monthly-income"],
    queryFn: fetchMonthlyIncome,
  });
  const { chartData, totalIncome, currentMonthPercentageIncrease } =
    mapChartData(monthlyIncome || []);

  return (
    <div className="flex flex-1 flex-col px-4 min-h-screen py-4">
      <div className="grid md:grid-cols-4 grid:cols-1 gap-4  mt-4">
        {count?.map((item) => (
          <Link key={item.id} href={item.link}>
            <DashboardCard
              focused={item.id === 1}
              count={item.count ?? 0}
              description={item.description}
              // percentageIncrease={item.percentageIncrease}
            />
          </Link>
        ))}
      </div>

      <div className="grid md:grid-cols-2 grid-cols-1 gap-4 my-8">
        <DasboardAreaChart
          data={chartData}
          number={totalIncome}
          percentageIncrease={currentMonthPercentageIncrease}
          title={t("charts.totalIncome")}
        />
        <Table
          title={t("tables.recentActivity")}
          headers={activityHeaders}
          cells={activityCells}
          columnStyles={{
            2: () => {
              return "w-[200px] truncate";
            },
            3: () => {
              return "w-[100px]";
            },
          }}
        />
      </div>
      <Table
        cells={ordersCells.slice(0, 3)}
        headers={ordersHeaders}
        isLoading={isPending}
        title={t("tables.recentOrders")}
        columnStyles={{
          7: (status) =>
            status === commonT("status.completed")
              ? "bg-green-500/[0.2] text-green-700 p-1 rounded-lg flex justify-center"
              : status === commonT("status.pending")
                ? "bg-yellow-500/[0.2] text-yellow-700 p-1 rounded-lg flex justify-center"
                : status === commonT("status.rejected")
                  ? "bg-red-500/[0.2] text-red-700 p-1 rounded-lg flex justify-center"
                  : "",
        }}
      />
    </div>
  );
};

export default Page;
