import { Briefcase } from "lucide-react";
import { useSupplierMarketplace } from "@/hooks/supplier/useSupplierMarketplace";
import { CardSkeleton } from "../ui/loading/CardSkeleton";
import { useSupplierDashboard } from "@/hooks/supplier";
import { useSupplierEarnings } from "@/hooks/supplier/useSupplierEarnings";
import { useTranslations } from "next-intl";

const Dashboard: React.FC = () => {
  const t = useTranslations("supplier");
  const { data } = useSupplierMarketplace({
    from_city: "",
    to_city: "",
    move_date: "",
    type_of_service: "",
  });
  const { data: dashboardData } = useSupplierDashboard();
  const {
    data: earnings,
    isLoading: earningsLoading,
    error: earningsError,
  } = useSupplierEarnings();

  const ongoingOrdersLength = dashboardData?.data.orders?.filter((order) =>
    ["pending", "ongoing", "accepted"].includes(order.order_status)
  ).length;
  // console.log("ool", ongoingOrdersLength, dashboardData);

  if (earningsLoading) return <CardSkeleton className="mb-4" />;
  if (earningsError)
    return (
      <div className="text-red-500 mb-4">
        {t("marketplace.error", { message: earningsError.message })}
      </div>
    );

  return (
    <div className="mb-6">
      <h1 className="mb-4 text-[16px] text-[#373737] font-semibold">
        {t("dashboard.overview")}
      </h1>
      {data && (
        <div className="flex md:grid md:grid-cols-3  gap-4 lg:gap-6 xl:gap-8 2xl:gap-12 overflow-x-auto no-scrollbar pb-4">
          <div className="border border-red-500 shadow-[2px_4px_6.5px_0px_rgba(0,0,0,0.24)] rounded-[10px] p-3 flex flex-col w-[240px] shrink-0 md:w-full md:shrink">
            <div className="flex justify-between items-center">
              <p>{t("dashboard.stats.totalJobs")}</p>
              <Briefcase className="w-5 h-5 text-red-500" />
            </div>
            <p className="font-bold text-[20px] mt-2">
              {data?.pages[0]?.pagination?.totalItems}
            </p>
          </div>

          <div className="border border-red-500 shadow-[2px_4px_6.5px_0px_rgba(0,0,0,0.24)] rounded-[10px] p-3 flex flex-col w-[240px] shrink-0 md:w-full md:shrink">
            <div className="flex justify-between items-center">
              <p>{t("dashboard.stats.ongoingJobs")}</p>
              <Briefcase className="w-5 h-5 text-red-500" />
            </div>
            <p className="font-bold text-[20px] mt-2">{ongoingOrdersLength}</p>
          </div>

          <div className="border border-red-500 shadow-[2px_4px_6.5px_0px_rgba(0,0,0,0.24)] rounded-[10px] p-3 flex flex-col w-[240px] shrink-0 md:w-full md:shrink">
            <div className="flex justify-between items-center">
              <p>{t("dashboard.stats.earningsMade")}</p>
              <Briefcase className="w-5 h-5 text-red-500" />
            </div>
            <p className="font-bold text-[20px] mt-2">
              SEK {earnings?.data?.totalEarnings.completed}
            </p>
          </div>
        </div>
      )}
    </div>
  );
};

export default Dashboard;
