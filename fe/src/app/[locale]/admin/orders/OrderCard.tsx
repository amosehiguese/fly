import React from "react";
import {
  Card,
  CardContent,
  //   CardDescription,
  //   CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { ShoppingCart } from "lucide-react";

interface DashboardCardProps {
  //   icon: string;
  focused: boolean;
  description: string;
  percentageIncrease: number;
  count: number;
}

const OrderCard = ({
  focused,
  description,
  percentageIncrease,
  count,
}: DashboardCardProps) => {
  return (
    <Card
      className={`${
        focused && "bg-black text-white dark:bg-gray-100 dark:text-black"
      }`}
    >
      <CardHeader>
        <CardTitle className="flex justify-between items-center mr-8">
          <div className="h-10 w-10 flex justify-center items-center bg-black">
            <ShoppingCart color="white" />
          </div>
          <div className={`border  p-2 rounded-[10px] border-[#252525]`}>
            +{percentageIncrease}%
          </div>
        </CardTitle>
        {/* <CardDescription>{description}</CardDescription> */}
      </CardHeader>
      <CardContent className="mt-4">
        <p className="text-[18px]">{description}</p>
        <p className="text-[26px] font-bold">{count}</p>
      </CardContent>
      {/* <CardFooter>
        <p>Card</p>
      </CardFooter> */}
    </Card>
  );
};

export default OrderCard;
