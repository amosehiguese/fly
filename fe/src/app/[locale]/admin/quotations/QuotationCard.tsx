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

interface QuotationCardProps {
  //   icon: string;
  focused: boolean;
  description: string;
  breakdown: {
    [key: string]: number;
  } | null;
  count: number;
}

const QuotationCard = ({
  focused,
  description,
  breakdown,
  count,
}: QuotationCardProps) => {
  return (
    <Card
      className={`${
        focused && "bg-black text-white dark:bg-gray-100 dark:text-black"
      }`}
    >
      <CardHeader>
        <CardTitle className="flex justify-between items-center "></CardTitle>
        <CardDescription className="">
          <CardContent className="flex  justify-between items-center ">
            <div className="h-10 w-10 flex justify-center items-center bg-black">
              <ShoppingCart color="white" />
            </div>
            <div
              className={`text-black space-y-2 dark:text-white ${
                focused &&
                "bg-black text-white dark:bg-gray-100 dark:text-black"
              }`}
            >
              <p className="text-[18px]">{description}</p>
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
                  <div className="text-[16px">
                    {key.charAt(0).toUpperCase() + key.slice(1)}
                  </div>
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

export default QuotationCard;
