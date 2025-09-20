"use client";

import FinanceOverview from "@/components/admin/FinanceOverview";
import WithdrawalDisbursement from "@/components/admin/WithdrawalDisbursement";
import React, { useState } from "react";
import WithdrawalSvg from "@/components/svg/icons/withdrawal";
import DisbursementSvg from "@/components/svg/icons/disbursement";
import {
  useFetchCompletedWithdrawals,
  useFetchFundsOverview,
} from "@/hooks/admin/useFetchWithdrawals";
import { useFetchPendingWithdrawals } from "@/hooks/admin/useFetchWithdrawals";
import Table from "@/components/Table";
import { formatTableData } from "@/lib/formatTable";
import {
  formatCompletedWithdrawalsData,
  formatPendingWithdrawalsData,
} from "@/lib/formatWithdrawalsData";
import {
  CompletedWithdrawal,
  PendingWithdrawal,
} from "@/api/interfaces/admin/withdrawal";
import { getAllKeys } from "@/lib/getAllKeys";
import { useTranslations } from "next-intl";

function Page() {
  const t = useTranslations("admin.finance");
  const tableHeaders = useTranslations("admin.tableHeaders");
  const commonT = useTranslations("common");
  const [tableTableToShow, setTableToShow] = useState<
    "completed" | "pending" | "ready"
  >("completed");
  const {
    completedWithdrawals,
    isCompletedWithdrawalsPending,
    completedWithdrawalsError,
  } = useFetchCompletedWithdrawals();
  const {
    pendingWithdrawals,
    isPendingWithdrawalsPending,
    pendingWithdrawalsError,
  } = useFetchPendingWithdrawals();

  const { fundsOverview } = useFetchFundsOverview();

  const formattedCompletedData =
    formatCompletedWithdrawalsData(
      completedWithdrawals?.data as CompletedWithdrawal[],
      commonT
    ) ?? [];
  const completedTableData = formattedCompletedData.map((item) => ({
    [tableHeaders("id")]: item.id,
    [tableHeaders("supplierName")]: item.supplierName,
    [tableHeaders("date")]: item.date,
    [tableHeaders("paymentAmount")]: item.paymentAmount,
    [tableHeaders("status")]: item.status,
  }));

  const formattedPendingData =
    formatPendingWithdrawalsData(
      pendingWithdrawals?.data as PendingWithdrawal[],
      commonT
    ) ?? [];
  const pendingTableData = formattedPendingData.map((item) => ({
    [tableHeaders("id")]: item.id,
    [tableHeaders("supplierName")]: item.supplierName,
    [tableHeaders("paymentAmount")]: item.paymentAmount,
    [tableHeaders("date")]: item.date,
    [tableHeaders("status")]: item.status,
  }));

  const {
    cells: completedWithdrawalCells,
    headers: completedWithdrawalHeaders,
  } = formatTableData(completedTableData);
  const { cells: pendingWithdrawalCells, headers: pendingWithdrawalHeaders } =
    formatTableData(pendingTableData);

  const keys = getAllKeys(pendingWithdrawals?.data ?? []) as Array<
    keyof PendingWithdrawal
  >;

  // Create a mapping of original keys to header labels
  const headerMapping = new Map<keyof PendingWithdrawal, string>(
    keys.map((key) => [
      key,
      String(key).charAt(0).toUpperCase() + String(key).slice(1),
    ])
  );

  // Get headers in the same order as keys
  const headers = Array.from(headerMapping.values());
  const dataRows =
    pendingWithdrawals?.data?.map((item) =>
      keys.map((key) => String(item[key] ?? ""))
    ) ?? [];

  const handleDownload = () => {
    // Create CSV content
    const headerRow = headers;
    const csvContent = [headerRow, ...dataRows].join("\n");
    // Create blob and download link
    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.setAttribute("href", url);
    link.setAttribute("download", `withdrawal-request.csv`);
    link.style.visibility = "hidden";
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="flex flex-1 flex-col px-4 min-h-screen py-4 w-full">
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
        <div className="col-span-2">
          <FinanceOverview
            focused={tableTableToShow === "completed"}
            totalMoney={Number(fundsOverview?.data?.total_money) || 0}
            incomingMoney={Number(fundsOverview?.data?.money_in) || 0}
            outgoingMoney={Number(fundsOverview?.data?.money_paid_out) || 0}
            onClick={() => setTableToShow("completed")}
          />
        </div>
        <WithdrawalDisbursement
          focused={tableTableToShow === "pending"}
          description={t("overview.totalWithdrawalRequests")}
          // percentageIncrease={10}
          amount={Number(fundsOverview?.data?.total_withdrawal_requests) || 0}
          icon={<WithdrawalSvg color="white" height={20} width={20} />}
          onClick={() => setTableToShow("pending")}
        />
        <WithdrawalDisbursement
          focused={tableTableToShow === "ready"}
          description={t("overview.readyForDisbursement")}
          // percentageIncrease={10}
          amount={Number(fundsOverview?.data?.ready_for_disbursement) || 0}
          icon={<DisbursementSvg color="white" height={20} width={20} />}
          onClick={() => setTableToShow("ready")}
        />
      </div>
      {tableTableToShow === "completed" ? (
        <Table
          title={t("completedWithdrawals.title")}
          cells={completedWithdrawalCells}
          headers={completedWithdrawalHeaders}
          isLoading={isCompletedWithdrawalsPending}
          error={!!completedWithdrawalsError}
        />
      ) : (
        <Table
          title={t("pendingWithdrawals.title")}
          cells={pendingWithdrawalCells}
          headers={pendingWithdrawalHeaders}
          isLoading={isPendingWithdrawalsPending}
          error={!!pendingWithdrawalsError}
          showDownload={true}
          handleDownload={handleDownload}
          downloadFileName="withdrawal-request"
        />
      )}
    </div>
  );
}

export default Page;
