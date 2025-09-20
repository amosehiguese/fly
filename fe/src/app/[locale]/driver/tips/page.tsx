"use client";

import { ArrowUp } from "lucide-react";
import { useDriverTips } from "@/hooks/driver";
import { useTranslations } from "next-intl";
import { useMemo } from "react";

export default function DriverTipsPage() {
  const t = useTranslations("driver.tips");
  const { data: tipsData, isLoading, error } = useDriverTips();

  const tips = tipsData?.data || [];

  // Calculate statistics
  const stats = useMemo(() => {
    const totalTips = tips.reduce(
      (sum, tip) => sum + parseFloat(tip.tip_amount),
      0
    );
    const totalOrders = tips.length;
    const onTimeDeliveries = Math.floor(totalOrders * 0.85); // Mock 85% on-time delivery
    const onTimePercentage =
      totalOrders > 0 ? Math.round((onTimeDeliveries / totalOrders) * 100) : 85;

    return {
      totalIncome: totalTips,
      totalOrders,
      onTimePercentage,
      monthlyGrowth: 0.4, // Mock 0.4% growth
    };
  }, [tips]);

  const formatTimeAgo = (tipDate: string | null) => {
    if (!tipDate) return t("justNow");

    const now = new Date();
    const date = new Date(tipDate);
    const diffInMinutes = Math.floor(
      (now.getTime() - date.getTime()) / (1000 * 60)
    );

    if (diffInMinutes < 60) {
      return `${diffInMinutes} ${t("minAgo")}`;
    }

    const diffInHours = Math.floor(diffInMinutes / 60);
    if (diffInHours < 24) {
      return `${diffInHours} ${t("hoursAgo")}`;
    }

    const diffInDays = Math.floor(diffInHours / 24);
    return `${diffInDays} ${t("daysAgo")}`;
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#FFFBFF]">
        <div className="text-center">
          <div className="h-8 w-8 border-4 border-t-green-500 border-b-gray-200 border-l-gray-200 border-r-gray-200 rounded-full animate-spin mx-auto mb-2"></div>
          <p className="text-[#373737]">{t("loadingEarnings")}</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#FFFBFF]">
        <div className="text-center max-w-md px-4">
          <h3 className="text-lg font-semibold text-[#373737] mb-2">
            {t("errorOccurred")}
          </h3>
          <p className="text-[#707070]">{t("couldNotLoadEarnings")}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#FFFBFF] pb-24 max-w-[800px] mx-auto">
      {/* Header */}
      <div className="px-4 py-6">
        <h1 className="text-2xl font-semibold text-[#373737] tracking-wide">
          {t("earnings")}
        </h1>
      </div>

      {/* Line separator */}
      <div className="w-full h-px bg-[#C4C4C4] mb-8"></div>

      {/* Stats Section */}
      <div className="px-4 mb-8">
        <div className="flex justify-between gap-3">
          {/* Total Income Card */}
          <div className="flex-1 w-1/2 h-32 bg-gradient-to-br from-white/20 via-white/40 to-[#01A638]/30 border-l border-white/50 rounded-[21px] p-3">
            <div className="h-full flex flex-col justify-between">
              <div>
                <p className="text-xs font-medium text-[#373737] tracking-wide mb-2">
                  {t("totalIncome")}
                </p>
                <p className="text-lg font-semibold text-[#373737] tracking-wide">
                  SEK{stats.totalIncome.toFixed(2)}
                </p>
              </div>
              <div className="flex items-center">
                <ArrowUp className="w-6 h-6 text-[#01A638] mr-1" />
                <span className="text-xs font-normal text-[#01A638] tracking-wide">
                  {stats.monthlyGrowth}% {t("thanLastMonth")}
                </span>
              </div>
            </div>
          </div>

          {/* Right Stats */}
          <div className="flex flex-col gap-2 w-1/2">
            {/* Total Orders */}
            <div className="bg-white rounded-xl p-3 h-[60px] flex flex-col justify-center">
              <p className="text-xs font-medium text-[#373737] tracking-wide">
                {t("totalOrders")}
              </p>
              <p className="text-lg font-semibold text-[#373737] tracking-wide">
                {stats.totalOrders}
              </p>
            </div>

            {/* On-time Delivery */}
            <div className="bg-white rounded-xl p-3 h-[60px] flex flex-col justify-center">
              <p className="text-xs font-medium text-[#373737] tracking-wide mb-1">
                {t("onTimeDelivery")}
              </p>
              <div className="flex items-center">
                <div className="w-[18px] h-[18px] bg-[#01A638] rounded-full mr-1"></div>
                <span className="text-lg font-semibold text-[#373737] tracking-wide">
                  {stats.onTimePercentage}%
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Latest Activity Section */}
      <div className="px-4">
        <div className="flex justify-between items-end mb-5">
          <h2 className="text-lg font-semibold text-black tracking-wide">
            {t("latestActivity")}
          </h2>
        </div>

        {/* Tips List */}
        <div className="space-y-2">
          {tips.length === 0 ? (
            <div className="bg-white rounded-lg p-6 text-center">
              <p className="text-[#707070] text-sm">{t("noTipsYet")}</p>
            </div>
          ) : (
            tips.map((tip, index) => (
              <div
                key={`${tip.order_id}-${index}`}
                className="bg-white rounded-lg p-3 flex justify-between items-center"
              >
                <div className="flex items-center">
                  {/* Tip Icon */}
                  {/* <div className="w-8 h-8 bg-[#9AFAB5]/40 rounded-2xl flex items-center justify-center mr-2">
                    <DollarSign className="w-[13px] h-4 text-[#01A638]" />
                  </div> */}
                  <div className="mr-2">
                    <svg
                      width="32"
                      height="32"
                      viewBox="0 0 32 32"
                      fill="none"
                      xmlns="http://www.w3.org/2000/svg"
                    >
                      <rect
                        width="32"
                        height="32"
                        rx="16"
                        fill="#9AFA95"
                        fill-opacity="0.4"
                      />
                      <path
                        d="M22.7391 12.6269C22.7391 13.0141 22.6628 13.3975 22.5146 13.7553C22.3664 14.113 22.1492 14.4381 21.8754 14.7119C21.6016 14.9857 21.2766 15.2029 20.9188 15.351C20.5611 15.4992 20.1777 15.5755 19.7904 15.5755C19.4032 15.5755 19.0198 15.4992 18.662 15.351C18.3043 15.2029 17.9792 14.9857 17.7054 14.7119C17.4316 14.4381 17.2144 14.113 17.0662 13.7553C16.9181 13.3975 16.8418 13.0141 16.8418 12.6269C16.8418 11.8448 17.1525 11.0948 17.7054 10.5419C18.2584 9.98888 19.0084 9.67822 19.7904 9.67822C20.5725 9.67822 21.3225 9.98888 21.8754 10.5419C22.4284 11.0948 22.7391 11.8448 22.7391 12.6269Z"
                        stroke="#01A638"
                        stroke-width="1.2637"
                        stroke-linecap="round"
                        stroke-linejoin="round"
                      />
                      <path
                        d="M18.3845 10.0345C18.1668 9.36779 17.7187 8.80043 17.1205 8.43418C16.5224 8.06794 15.8133 7.92677 15.1205 8.03601C14.4276 8.14524 13.7964 8.49772 13.3399 9.03024C12.8835 9.56276 12.6316 10.2405 12.6296 10.9419C12.6296 11.4529 12.7623 11.9551 13.0148 12.3994C13.2673 12.8436 13.6309 13.2147 14.07 13.476C14.5091 13.7374 15.0086 13.8802 15.5195 13.8904C16.0304 13.9006 16.5352 13.7778 16.9843 13.5341M9.25977 17.2604H11.2775C11.5252 17.2604 11.7695 17.316 11.991 17.4238L13.7114 18.2562C13.9329 18.3632 14.1772 18.4188 14.4258 18.4188H15.3036C16.1528 18.4188 16.842 19.0852 16.842 19.9074C16.842 19.9411 16.8192 19.9697 16.7864 19.979L14.6457 20.5713C14.2615 20.6774 13.8519 20.6402 13.4932 20.4668L11.6541 19.5772M16.842 19.3665L20.7114 18.1778C21.0483 18.0744 21.4092 18.0801 21.7426 18.1941C22.0761 18.308 22.365 18.5243 22.5682 18.8122C22.8791 19.2418 22.7527 19.8585 22.2995 20.1197L15.9683 23.7735C15.7704 23.888 15.5511 23.9611 15.324 23.9881C15.0969 24.0152 14.8667 23.9958 14.6473 23.931L9.25977 22.332"
                        stroke="#01A638"
                        stroke-width="1.2637"
                        stroke-linecap="round"
                        stroke-linejoin="round"
                      />
                    </svg>
                  </div>

                  {/* Tip Info */}
                  <div>
                    <div className="flex items-center mb-1">
                      <span className="text-sm font-medium text-[#373737]">
                        {t("tips")}
                      </span>
                    </div>
                    <span className="text-xs font-light text-[#707070]">
                      {formatTimeAgo(tip.tip_date)}
                    </span>
                  </div>
                </div>

                {/* Amount and Status */}
                <div className="text-right">
                  <div className="text-sm font-medium text-[#373737]">
                    SEK{parseFloat(tip.tip_amount).toFixed(0)}
                  </div>
                  <div className="text-xs font-light text-[#707070]">
                    {t("received")}
                  </div>
                </div>
              </div>
            ))
          )}
        </div>

        {/* Show message if only mock data */}
        {tips.length > 0 && (
          <div className="mt-4 text-center">
            <p className="text-xs text-[#707070]">{t("showingLatestTips")}</p>
          </div>
        )}
      </div>
    </div>
  );
}
