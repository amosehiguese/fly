"use client";

import React, { Suspense, useState } from "react";
import QuotationBidCard from "./QuotationBidCard";
import { useDashboardCounts } from "@/hooks/admin/useDashboardCounts";
import Quotation from "./Quotation";
import Bids from "./Bids";
import { useSearchParams } from "next/navigation";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { useAuctionStatus } from "@/hooks/admin/useAuctionStatus";
import { useTranslations } from "next-intl";

const Content = () => {
  const t = useTranslations("admin.quotesBids");
  const searchParams = useSearchParams();
  const focusedParam = searchParams.get("focused");
  const { data, toggleAuction } = useAuctionStatus();
  const { data: dashboardCounts } = useDashboardCounts();

  const [focused, setIsFocused] = useState<"quotes" | "bids">(
    focusedParam === "bids"
      ? "bids"
      : focusedParam === "quotes"
        ? "quotes"
        : "quotes"
  );

  const handleToggle = () => {
    toggleAuction(!data?.auctionEnabled);
  };

  return (
    <div className="flex flex-1 flex-col px-4 min-h-screen py-4">
      <div className="w-full flex justify-end">
        <div
          className="flex items-center space-x-2 border-[1.5px] border-black rounded-[16px] p-2"
          style={{ boxShadow: "0px 4px 4px 0px rgba(0, 0, 0, 0.25)" }}
        >
          <Label htmlFor="auto-bid-mode">{t("autoBids.label")}</Label>
          <Switch
            id="auto-bid-mode"
            checked={data?.auctionEnabled}
            onCheckedChange={handleToggle}
          />
        </div>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 my-4">
        {dashboardCounts && (
          <>
            <button onClick={() => setIsFocused("quotes")}>
              <QuotationBidCard
                focused={focused === "quotes"}
                count={Number(dashboardCounts?.quotations?.total) || 0}
                description={t("cards.quotes.title")}
                breakdown={{
                  ...Object.fromEntries(
                    Object.entries(dashboardCounts.quotations).filter(
                      ([key]) => key !== "total"
                    )
                  ),
                }}
                key={3}
              />
            </button>
            <button onClick={() => setIsFocused("bids")}>
              <QuotationBidCard
                focused={focused === "bids"}
                count={Number(dashboardCounts?.bids?.total) || 0}
                description={t("cards.bids.title")}
                breakdown={{
                  ...Object.fromEntries(
                    Object.entries(dashboardCounts.bids).filter(
                      ([key]) => key !== "total"
                    )
                  ),
                }}
                key={2}
              />
            </button>
          </>
        )}
      </div>
      {focused === "quotes" ? (
        <Quotation />
      ) : focused === "bids" ? (
        <Bids />
      ) : null}
    </div>
  );
};

const Page = () => {
  const t = useTranslations("admin.quotesBids");
  return (
    <Suspense fallback={<div>{t("loading")}</div>}>
      <Content />
    </Suspense>
  );
};

export default Page;
