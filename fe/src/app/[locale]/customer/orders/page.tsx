"use client";

import React from "react";
import { MobileNav } from "./MobileNav";
import { useCustomerDashboard } from "@/hooks/customer/useCustomerDashboard";
import { OrdersTabs } from "@/components/customers/OrdersTabs";

const Page = () => {
  const { data } = useCustomerDashboard();
  const myOrders = data?.data.orders;
  const myQuotations = data?.data.quotations;

  return (
    <div className="px-4">
      <MobileNav />
      <OrdersTabs orders={myOrders} quotations={myQuotations} />
    </div>
  );
};

export default Page;
