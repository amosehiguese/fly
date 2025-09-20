"use client";

import { Input } from "@/components/ui/input";
import { useCustomerDashboard } from "@/hooks/customer/useCustomerDashboard";
import { useState, useMemo } from "react";
import { DisputeCard } from "@/components/customers/DisputeCard";
import { MobileNav } from "./MobileNav";
import { Button } from "@/components/ui/button";
import { useDebounce } from "@/hooks/useDebounce";
import { useTranslations } from "next-intl";

type FilterStatus = "ALL" | "Completed" | "Ongoing";

const Page = () => {
  const { data } = useCustomerDashboard();
  const [searchQuery, setSearchQuery] = useState("");
  const [filterStatus, setFilterStatus] = useState<FilterStatus>("ALL");
  const debouncedSearch = useDebounce(searchQuery, 300);
  const t = useTranslations("customers.disputes");

  const filteredDisputes = useMemo(() => {
    if (!data?.data.disputes) return [];

    return data.data.disputes.filter((dispute) => {
      const matchesSearch = dispute.reason
        .toLowerCase()
        .includes(debouncedSearch.toLowerCase());

      const matchesStatus =
        filterStatus === "ALL" ||
        (filterStatus === "Completed"
          ? dispute.status === "resolved"
          : dispute.status !== "resolved");

      return matchesSearch && matchesStatus;
    });
  }, [data?.data.disputes, debouncedSearch, filterStatus]);

  return (
    <div className="px-4">
      <MobileNav />

      <div className="mb-6 space-y-4">
        <Input
          placeholder={t("searchPlaceholder")}
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="max-w-md"
        />

        <div className="flex gap-2">
          <Button
            variant={filterStatus === "ALL" ? "default" : "outline"}
            onClick={() => setFilterStatus("ALL")}
          >
            {t("filters.all")}
          </Button>
          <Button
            variant={filterStatus === "Completed" ? "default" : "outline"}
            onClick={() => setFilterStatus("Completed")}
          >
            {t("filters.completed")}
          </Button>
          <Button
            variant={filterStatus === "Ongoing" ? "default" : "outline"}
            onClick={() => setFilterStatus("Ongoing")}
          >
            {t("filters.ongoing")}
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-8">
        {filteredDisputes.map((dispute, index) => (
          <DisputeCard key={index} dispute={dispute} />
        ))}
      </div>
    </div>
  );
};

export default Page;
