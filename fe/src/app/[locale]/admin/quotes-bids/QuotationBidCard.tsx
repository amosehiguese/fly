import React from "react";
import {
  Card,
  CardContent,
  CardDescription,
  //   CardDescription,
  //   CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { ShoppingCart } from "lucide-react";
import { Separator } from "@/components/ui/separator";
import { useTranslations } from "next-intl";

interface QuotationCardProps {
  //   icon: string;
  focused: boolean;
  description: string;
  breakdown: {
    [key: string]: number;
  } | null;
  count: number;
}

const QuotationBidCard = ({
  focused,
  description,
  breakdown,
  count,
}: QuotationCardProps) => {
  const tCommon = useTranslations("common");
  return (
    <Card
      className={`${
        focused && "bg-black text-white dark:bg-gray-100 dark:text-black"
      }`}
    >
      <CardHeader>
        <CardTitle className="flex justify-between items-center "></CardTitle>
        <CardDescription className="">
          <CardContent
            className={`text-black flex justify-between items-center dark:text-white ${
              focused && " text-white dark:text-black"
            }`}
          >
            <div className="h-10 w-10 flex justify-center items-center bg-black">
              <ShoppingCart color="white" />
            </div>
            <div className="space-y-2">
              <p className="text-[18px] font-semibold">{description}</p>
              <p className="text-[24px] font-bold">{count}</p>
            </div>
          </CardContent>
          <Separator className="w-full" />
          <CardContent
            className={`text-black dark:text-white pt-3 justify-between flex ${
              focused && " text-white dark:text-black"
            }`}
          >
            {breakdown &&
              Object.entries(breakdown).map(([key, value]) => (
                <div className="space-y-2 text-center" key={key}>
                  <div className="text-[16px]">{tCommon(`status.${key}`)}</div>
                  <div className="text-[20px] font-bold">{value}</div>
                </div>
              ))}
          </CardContent>
        </CardDescription>
      </CardHeader>

      {/* <CardFooter>
        <p>Card</p>
      </CardFooter> */}
    </Card>
  );
};

export default QuotationBidCard;
