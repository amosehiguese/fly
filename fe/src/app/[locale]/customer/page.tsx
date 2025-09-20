"use client";

import { Button } from "@/components/ui/button";
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselApi,
} from "@/components/ui/carousel";
import Autoplay from "embla-carousel-autoplay";
import Image from "next/image";
import React, { useEffect, useState } from "react";
import { OrderCard } from "@/components/customers/OrderCard";
import { DisputeCard } from "@/components/customers/DisputeCard";
import { MobileNav } from "./MobileNav";
import { Link } from "@/i18n/navigation";
import { useCustomerDashboard } from "@/hooks/customer/useCustomerDashboard";
import { useTranslations } from "next-intl";

const Page = () => {
  const t = useTranslations("customers.dashboard");
  const [api, setApi] = useState<CarouselApi>();
  const [current, setCurrent] = useState(0);
  const [activeTab, setActiveTab] = useState("orders");

  const { data } = useCustomerDashboard();

  const myDisputes = data?.data.disputes;
  const myOrders = data?.data.orders;

  const tabs = [
    { id: "orders", label: t("tabs.orders") },
    { id: "disputes", label: t("tabs.disputes") },
  ];

  useEffect(() => {
    if (!api) return;

    api.on("select", () => {
      setCurrent(api.selectedScrollSnap());
    });
  }, [api]);

  return (
    <div className="min-h-screen">
      {/* Header Section */}
      <header className="z-10 backdrop-blur-sm">
        <div className=" pt-0 sticky top-0 px-4">
          <div className="max-w-[1280px] mx-auto flex items-center">
            <MobileNav />
            {/* Your other header content */}
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-[1280px] mx-auto px-4 md:px-0 pb-4">
        {/* Carousel section */}
        <section className="my-4 md:my-2">
          <Carousel
            opts={{ loop: true }}
            setApi={setApi}
            className="relative max-w-[1280px] mx-auto"
            plugins={[
              Autoplay({
                delay: 5000,
                stopOnMouseEnter: true,
              }),
            ]}
          >
            <CarouselContent>
              <CarouselItem>
                <Image
                  src={"/05.jpg"}
                  alt="move with flyttman"
                  width={1000}
                  height={600}
                  className="w-full h-auto max-h-[50vh] lg:max-h-[50vh] object-cover rounded-[10px]"
                  priority
                />
              </CarouselItem>
              <CarouselItem>
                <Image
                  src={"/06.jpg"}
                  alt="move with flyttman"
                  width={1000}
                  height={600}
                  className="w-full h-auto max-h-[50vh] lg:max-h-[50vh] object-cover rounded-[10px]"
                />
              </CarouselItem>
              {/* <CarouselItem>...</CarouselItem> */}
            </CarouselContent>

            {/* Dots indicator */}
            <div className="flex mt-2 justify-center gap-2">
              {[...Array(api?.scrollSnapList().length || 0)].map((_, index) => (
                <button
                  key={index}
                  className={`w-2 h-2 rounded-full transition-colors ${
                    current === index ? "bg-black" : "bg-[#C4C4C4]"
                  }`}
                  onClick={() => api?.scrollTo(index)}
                />
              ))}
            </div>
          </Carousel>
        </section>

        {/* Quick Actions */}
        <section className="my-6 md:my-2">
          <h2 className="text-xl md:text-2xl font-semibold mb-3 md:mb-2">
            {t("quickActions")}
          </h2>
          <div className="flex flex-wrap gap-4">
            <Link
              href={`customer/get-quotation`}
              className="flex-grow sm:flex-grow-0"
            >
              <Button className="rounded-[10px] w-full sm:w-auto md:min-w-[180px] py-5 md:py-6 bg-black font-semibold text-base">
                {t("buttons.getQuote")}
              </Button>
            </Link>
            <Link
              href={"customer/raise-dispute"}
              className="flex-grow sm:flex-grow-0"
            >
              <Button className="rounded-[10px] w-full sm:w-auto md:min-w-[180px] py-5 md:py-6 bg-black font-semibold text-base">
                {t("buttons.raiseDispute")}
              </Button>
            </Link>
          </div>
        </section>

        {/* All Activities */}
        <section className="my-8">
          <div className="flex items-center font-bold justify-between mb-4">
            <h2 className="text-xl md:text-2xl">{t("allActivities")}</h2>
            {/* <Button variant="ghost" className="flex items-center gap-2">
              <Filter className="w-5 h-5" />
              FILTER
            </Button> */}
          </div>

          {/* Tabs */}
          <div className="grid grid-cols-2 relative border mt-4 rounded-[20px] border-gray-200">
            <div
              className="absolute inset-y-0 transition-all duration-200 ease-in-out bg-primary rounded-[20px]"
              style={{
                left: activeTab === "orders" ? "0%" : "50%",
                width: "50%",
              }}
            />

            {tabs.map((tab) => (
              <button
                key={tab.id}
                className={`relative py-2 md:py-3 px-4 md:px-6 text-base md:text-lg rounded-[20px] font-semibold focus:outline-none transition-colors duration-200 ${
                  activeTab === tab.id
                    ? "text-white"
                    : "text-primary font-light"
                }`}
                onClick={() => setActiveTab(tab.id)}
              >
                {tab.label}
              </button>
            ))}
          </div>

          {/* Content */}
          <div className="mt-4">
            <div className="text-md flex justify-between font-semibold">
              <span className="text-base md:text-lg">
                {activeTab === "orders"
                  ? t("orders.allOrders")
                  : t("disputes.allDisputes")}
              </span>
              <Link
                href={
                  activeTab === "orders"
                    ? "/customer/orders"
                    : "/customer/disputes"
                }
                className="text-blue-400"
              >
                {t("viewAll")}
              </Link>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6 lg:gap-8 mt-3 md:mt-4">
              {activeTab === "orders" ? (
                myOrders && myOrders.length > 0 ? (
                  myOrders
                    .sort(
                      (a, b) =>
                        new Date(b.order_created_at).getTime() -
                        new Date(a.order_created_at).getTime()
                    )
                    .map((order, index) => (
                      <OrderCard key={index} order={order} />
                    ))
                ) : (
                  <div className="col-span-full text-center py-8 bg-gray-50 rounded-lg">
                    <div className="flex justify-center mb-4">
                      <svg
                        className="w-20 h-20 lg:w-32 md:h-32 text-gray-300"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={1}
                          d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4"
                        />
                      </svg>
                    </div>
                    <h3 className="text-lg md:text-xl font-medium text-gray-900 mb-1">
                      {t("orders.empty.title")}
                    </h3>
                    <p className="text-gray-500 mb-4 px-4">
                      {t("orders.empty.description")}
                    </p>
                    <Link href="/customer/get-quotation">
                      <Button className="bg-black hover:bg-gray-800 transition-colors px-6">
                        {t("orders.empty.button")}
                      </Button>
                    </Link>
                  </div>
                )
              ) : myDisputes && myDisputes.length > 0 ? (
                myDisputes
                  .sort(
                    (a, b) =>
                      new Date(b.dispute_created_at || "").getTime() -
                      new Date(a.dispute_created_at || "").getTime()
                  )
                  .map((dispute, index) => (
                    <DisputeCard key={index} dispute={dispute} />
                  ))
              ) : (
                <div className="col-span-full text-center py-8 bg-gray-50 rounded-lg">
                  <div className="flex justify-center mb-4">
                    <svg
                      className="w-20 h-20 lg:w-32 md:h-32 text-gray-300"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={1}
                        d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
                      />
                    </svg>
                  </div>
                  <h3 className="text-lg md:text-xl font-medium text-gray-900 mb-1">
                    {t("disputes.empty.title")}
                  </h3>
                  <p className="text-gray-500 mb-4 px-4">
                    {t("disputes.empty.description")}
                  </p>
                  <Link href="/customer/raise-dispute">
                    <Button className="bg-black hover:bg-gray-800 transition-colors px-6">
                      {t("disputes.empty.button")}
                    </Button>
                  </Link>
                </div>
              )}
            </div>
          </div>
        </section>
      </main>
    </div>
  );
};

export default Page;
