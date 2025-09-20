import React from "react";
import {
  Card,
  CardContent,
  CardDescription,
  //   CardDescription,
  //   CardFooter,
  CardHeader,
} from "@/components/ui/card";
import { formatNumber } from "@/lib/formatNumber";
import { Separator } from "../ui/separator";
import MoneyBagSvg from "../svg/icons/money-bag";
import { useTranslations } from "next-intl";

interface FinanceOverviewProps {
  //   icon: string;
  focused: boolean;
  totalMoney: number;
  incomingMoney: number;
  outgoingMoney: number;
  onClick: () => void;
}
const FinanceOverview = ({
  focused,
  totalMoney,
  incomingMoney,
  outgoingMoney,
  onClick,
}: FinanceOverviewProps) => {
  const t = useTranslations("admin.finance.overview");
  return (
    <button onClick={onClick} className="w-full">
      <Card
        className={`${
          focused && "bg-black text-white dark:bg-gray-100 dark:text-black"
        }`}
      >
        <CardHeader>
          <CardDescription
            className={`flex justify-between mb-4 ${
              focused ? "text-white" : "text-black"
            } items-center mr-8`}
          >
            <div
              className={`h-10 w-10 rounded-lg flex justify-center items-center border bg-black ${focused ? "border-white dark:border-black" : "border-black dark:border-white"}`}
            >
              <MoneyBagSvg color={"white"} height={20} width={20} />
            </div>
            <div
              className={`space-y-2 p-2 rounded-[10px] ${focused ? "text-white dark:text-black" : "text-black dark:text-white"}`}
            >
              <div className="text-[20px]">{t("totalMoney")}</div>
              <div className="text-[28px] font-bold">
                {formatNumber(totalMoney)} SEK
              </div>
            </div>
          </CardDescription>
          <div className=" border-t border-dashed border-[#D9D9D9] w-full" />
          {/* <CardDescription>{description}</CardDescription> */}
        </CardHeader>
        <CardContent className="mt-4 flex justify-center">
          <div className="flex flex-col">
            <p className="text-[18px] text-center">{t("incomingMoney")}</p>
            <p className="text-[22px] font-bold">
              {formatNumber(incomingMoney)} SEK
            </p>
          </div>
          <Separator
            orientation="vertical"
            className="h-16 bg-[#D9D9D9] mx-8"
          />
          <div className="flex flex-col">
            <p className="text-[18px] text-center">{t("outgoingMoney")}</p>
            <p className="text-[22px] font-bold">
              {formatNumber(outgoingMoney)} SEK
            </p>
          </div>
        </CardContent>
        {/* <CardFooter>
        <p>Card</p>
      </CardFooter> */}
      </Card>
    </button>
  );
};

export default FinanceOverview;
